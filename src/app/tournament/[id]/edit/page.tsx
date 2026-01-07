import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Legacy route: /tournament/[id]/edit
 * Redirects to the new bracket-based edit route or dashboard.
 *
 * - If user has bracket(s) for this tournament: redirects to first bracket's edit page
 * - If user has no brackets: redirects to dashboard to create one
 * - If not logged in: redirects to login
 */
export default async function LegacyBracketEditorPage({ params }: PageProps) {
  const { id: tournamentId } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Find user's brackets for this tournament
  const { data: brackets } = await supabase
    .from("brackets")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (brackets && brackets.length > 0) {
    // Redirect to first bracket's edit page
    redirect(`/bracket/${brackets[0].id}/edit`);
  } else {
    // No brackets - redirect to dashboard where they can create one
    redirect("/");
  }
}
