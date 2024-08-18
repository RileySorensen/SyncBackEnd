import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fnzpgwxwkzhtrxupaeer.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuenBnd3h3a3podHJ4dXBhZWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM5NDgzMTIsImV4cCI6MjAzOTUyNDMxMn0.8rau3_fv_0X-xvbzNuFyPImAtrB2HFeyAa9YZlN6hIE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;