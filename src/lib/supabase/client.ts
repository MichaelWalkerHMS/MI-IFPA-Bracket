import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser/client components.
 *
 * Use this in components that have "use client" directive or
 * in event handlers, useEffect, etc.
 *
 * Example:
 *   const supabase = createClient();
 *   const { data } = await supabase.from('tournaments').select();
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
