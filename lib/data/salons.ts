import type { SupabaseClient } from "@supabase/supabase-js";
import type { Salon } from "@/lib/types";

export async function listSalons(db: SupabaseClient): Promise<Salon[]> {
  const { data, error } = await db.from("salons").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getSalon(db: SupabaseClient, id: string): Promise<Salon | null> {
  const { data, error } = await db.from("salons").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
