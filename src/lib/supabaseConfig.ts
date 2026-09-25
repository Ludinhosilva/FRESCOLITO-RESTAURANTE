// Configuracion publica de Supabase.
// La anon key es PUBLICA (protegida por RLS); se usa como respaldo cuando
// no hay variables de entorno (p. ej. build en Vercel). En local, el archivo
// .env (PUBLIC_SUPABASE_*) tiene prioridad y apunta a staging.
export const PROD_SUPABASE_URL = 'https://ukuaaybbnovuywbcklha.supabase.co'
export const PROD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWFheWJibm92dXl3YmNrbGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTQ3NjUsImV4cCI6MjEwNDY3MDc2NX0.eMnZ8s9TPqI0NKGOw83ac6GLIMsb3Ra1LIv0PtOH4wQ'
