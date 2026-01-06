import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";

/**
 * Shared auth header component that displays:
 * - Logged in: [Admin link if admin] [email] [Log Out]
 * - Logged out: [Log In] [Sign Up]
 */
export default async function AuthHeader() {
  const supabase = await createClient();

  // Get current user
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
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="px-4 py-2 text-sm bg-[rgb(var(--color-accent-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-accent-hover))]"
          >
            Admin
          </Link>
        )}
        <span className="text-sm text-[rgb(var(--color-text-secondary))]">{user.email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-[rgb(var(--color-bg-tertiary))] rounded-lg hover:bg-[rgb(var(--color-border-secondary))]"
          >
            Log Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="px-4 py-2 text-sm bg-[rgb(var(--color-bg-tertiary))] rounded-lg hover:bg-[rgb(var(--color-border-secondary))]"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 text-sm bg-[rgb(var(--color-accent-primary))] text-white rounded-lg hover:bg-[rgb(var(--color-accent-hover))]"
      >
        Sign Up
      </Link>
    </div>
  );
}
