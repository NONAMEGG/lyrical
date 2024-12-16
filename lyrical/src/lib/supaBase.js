import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://wfgqrxoadlatrszkqrlv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZ3FyeG9hZGxhdHJzemtxcmx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzA2NjEyNSwiZXhwIjoyMDQ4NjQyMTI1fQ.BpvuePT4R6_SngRZegQ1jQDwvMaM2ciqeA2gUpBOTLw"
);
