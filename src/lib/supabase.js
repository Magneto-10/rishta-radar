import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxvvhnqzkygldjeuzjay.supabase.co'
const supabaseKey = 'sb_publishable_qO70Wk9VoCmhen0l936xNA_3lmi4a0x'

export const supabase = createClient(supabaseUrl, supabaseKey)
