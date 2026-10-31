// Ejecuta archivos .sql de migracion contra la BD de Supabase (pooler, SSL).
// Requiere DATABASE_URL en .env (ver .env.example). No imprime credenciales.
//
// Uso:
//   node scripts/migrate.mjs supabase/migrations/0019_promociones.sql supabase/migrations/0018_seguridad.sql
//
// La contraseña se toma SOLO de .env (ya gitignoreado). Obtenla en:
//   Supabase > Project Settings > Database > Connection string (pooler).
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

try {
  process.loadEnvFile('.env')
} catch {
  // Sin .env: se usan las variables del entorno tal cual.
}

const DATABASE_URL = process.env.DATABASE_URL
const files = process.argv.slice(2)

if (!DATABASE_URL) {
  console.error('Falta DATABASE_URL en .env. Copia la plantilla de .env.example.')
  process.exit(1)
}
if (files.length === 0) {
  console.error('Uso: node scripts/migrate.mjs <archivo.sql> [archivo.sql ...]')
  process.exit(1)
}

// max: 1 para correr las migraciones de forma secuencial sobre una sola conexion.
// ssl: 'require' es obligatorio para Supabase.
const sql = postgres(DATABASE_URL, { max: 1, ssl: 'require' })

try {
  for (const file of files) {
    const contenido = readFileSync(file, 'utf8').trim()
    if (!contenido) {
      console.log(`-   ${file} (vacio, omitido)`)
      continue
    }
    // .simple() usa el protocolo simple, que admite multiples sentencias
    // y cuerpos de funcion con $$ ... $$.
    await sql.unsafe(contenido).simple()
    console.log(`ok  ${file}`)
  }
  console.log('Migraciones aplicadas correctamente.')
} catch (err) {
  console.error('ERROR en migracion: ' + (err?.message || err))
  process.exitCode = 1
} finally {
  await sql.end()
}
