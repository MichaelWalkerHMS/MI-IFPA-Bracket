import { requireAdmin } from "@/components/admin/AdminGuard";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if not authenticated or not an admin
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Title */}
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">
                  Admin Panel
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-4">
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Tournaments
                </Link>
              </nav>
            </div>

            {/* Right side - User info & logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile.display_name || profile.email}
              </span>
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Site
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
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
