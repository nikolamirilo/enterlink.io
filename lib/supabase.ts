import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
}

// Create a Supabase client with the service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Create a Supabase client with the anon key for client-side operations
export const createSupabaseClient = () => {
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseAnonKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return createClient(supabaseUrl, supabaseAnonKey)
}
