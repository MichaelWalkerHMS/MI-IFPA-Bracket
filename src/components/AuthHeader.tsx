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
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Admin
          </Link>
        )}
        <span className="text-sm text-gray-600">{user.email}</span>
        <form action={signOut}>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
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
        className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Sign Up
      </Link>
    </div>
  );
}
