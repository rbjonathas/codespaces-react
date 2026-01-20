import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL="https://aiaxiynthbexcwffobkl.supabase.co",
    import.meta.env.VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpYXhpeW50aGJleGN3ZmZvYmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTc0NTQsImV4cCI6MjA4NDQzMzQ1NH0.QY3lhLxUELEomqbGTN4QXulspMHhSqLSEY9IiDdQFkQ"
);