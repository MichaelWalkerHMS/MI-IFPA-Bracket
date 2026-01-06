import { requireAdmin } from "@/components/admin/AdminGuard";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";
import SettingsButton from "@/components/SettingsButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if not authenticated or not an admin
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-secondary))]">
      {/* Admin Header */}
      <header className="bg-[rgb(var(--color-bg-primary))] border-b border-[rgb(var(--color-border-primary))] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Title */}
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  Admin Panel
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] text-sm font-medium"
                >
                  Tournaments
                </Link>
              </nav>
            </div>

            {/* Right side - User info & logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                {profile.display_name || profile.email}
              </span>
              <Link
                href="/"
                className="text-sm text-[rgb(var(--color-accent-primary))] hover:text-[rgb(var(--color-accent-hover))]"
              >
                View Site
              </Link>
              <SettingsButton />
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-[rgb(var(--color-bg-tertiary))] rounded-lg hover:bg-[rgb(var(--color-border-secondary))]"
                >
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
