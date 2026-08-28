import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fkfjlpsajbuuxaonxrtu.supabase.co"

const supabaseKey = "sb_publishable_tXxK9BKVTdmx5EELr0vhVw_QoT5-UwY"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)