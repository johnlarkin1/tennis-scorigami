import { createClient } from "@supabase/supabase-js";
import { Database } from "@/supabase/database.types";

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_KEY = process.env.SUPABASE_KEY as string;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
