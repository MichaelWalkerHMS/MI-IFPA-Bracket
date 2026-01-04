import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Server component that checks if the current user is an admin.
 * If not authenticated or not an admin, redirects to home page.
 *
 * Usage: Call this at the top of any admin page to protect it.
 *
 * @returns The authenticated admin user and their profile
 */
export async function requireAdmin() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an admin
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.is_admin) {
    // Not an admin - redirect to home
    redirect("/");
  }

  return { user, profile };
}
