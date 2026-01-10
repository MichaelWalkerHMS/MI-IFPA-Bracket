import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";

/**
 * Mobile-specific auth header for hamburger menu.
 * Styled to match nav links layout.
 */
export default async function MobileAuthHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, check if user is admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.is_admin ?? false;
  }

  if (user) {
    return (
      <div className="space-y-1">
        <div className="px-3 py-2 text-sm text-[rgb(var(--color-text-muted))] truncate">
          {user.email}
        </div>
        {isAdmin && (
          <Link
            href="/admin"
            className="block px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg"
          >
            Admin
          </Link>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="block w-full text-left px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg"
          >
            Log Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Link
        href="/login"
        className="block px-3 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="block px-3 py-2 text-sm text-[rgb(var(--color-accent-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg font-medium"
      >
        Sign Up
      </Link>
    </div>
  );
}
