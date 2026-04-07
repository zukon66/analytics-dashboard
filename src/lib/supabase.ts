import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type ScanRecord = {
  id: number;
  table_id: string;
  zone: string;
  city: string;
  scanned_at: string; // ISO timestamp
  duration_minutes: number;
};

export type ZoneSummary = {
  zone: string;
  total_scans: number;
  table_count: number;
};
