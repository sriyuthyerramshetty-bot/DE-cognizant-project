import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY

// This instance is used to talk directly to your database
export const supabase = createClient(supabaseUrl, supabaseKey)