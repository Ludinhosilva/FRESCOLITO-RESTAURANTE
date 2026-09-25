// Regenera src/lib/database.types.ts desde Supabase.
// Uso:
//   $env:SUPABASE_ACCESS_TOKEN="sbp_xxx"
//   npm run types
//
// Opcional: define SUPABASE_PROJECT_REF para elegir el proyecto (por defecto staging).
import { writeFileSync } from 'node:fs'

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN
const REF = process.env.SUPABASE_PROJECT_REF || 'scivqxdtmvlzmpszxbku'

if (!TOKEN) {
  console.error('Falta SUPABASE_ACCESS_TOKEN (token personal de Supabase).')
  process.exit(1)
}

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/types/typescript`, {
  headers: { Authorization: `Bearer ${TOKEN}` },
})
if (!res.ok) {
  console.error('Error al generar tipos:', res.status, (await res.text()).slice(0, 200))
  process.exit(1)
}
const json = await res.json()
const types = typeof json === 'string' ? json : json.types

const header =
  '// Tipos generados desde Supabase (no editar a mano).\n' +
  '// Regenerar con: npm run types\n\n'

writeFileSync('src/lib/database.types.ts', header + types, 'utf8')
console.log(`src/lib/database.types.ts actualizado (${types.length} bytes) desde ${REF}`)
