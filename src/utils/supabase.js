import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL="https://pkhoeevqowvttnwhjbke.supabase.co",
    import.meta.env.VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraG9lZXZxb3d2dHRud2hqYmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzQ0MzEsImV4cCI6MjA3MzExMDQzMX0.huP7kiqJYaIy_bK_qNChTVmrc1_VDrq6MAZKwTgURfY"
);