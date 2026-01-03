import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback route - handles code exchange from Supabase email links.
 *
 * When a user clicks a password reset (or email confirmation) link,
 * Supabase redirects them here with a `code` parameter. We exchange
 * that code for a session, then redirect to the appropriate page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success - redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If no code or exchange failed, redirect to an error page
  // For now, redirect to login with an error indication
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
