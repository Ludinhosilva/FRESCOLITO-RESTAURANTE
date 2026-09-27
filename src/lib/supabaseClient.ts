import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Las credenciales de Supabase se toman SOLO de variables de entorno.
// - Local: archivo .env (proyecto de STAGING).
// - Vercel: Settings → Environment Variables, por entorno:
//     Production → Supabase PROD
//     Preview    → Supabase STAGING
// Ya no hay credenciales hardcodeadas en el repo (mas seguro).
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Frescolito] Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY. ' +
      'En local crea el archivo .env (ver .env.example). ' +
      'En Vercel configuralas en Settings → Environment Variables (Production y Preview).',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
