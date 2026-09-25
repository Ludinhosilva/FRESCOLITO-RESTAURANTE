import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { PROD_SUPABASE_URL, PROD_SUPABASE_ANON_KEY } from './supabaseConfig.js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || PROD_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || PROD_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
