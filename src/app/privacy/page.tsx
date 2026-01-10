import Link from "next/link";
import ResponsiveHeader from "@/components/ResponsiveHeader";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <Link href="/" className="text-[rgb(var(--color-accent-primary))] hover:underline">
          <span className="hidden sm:inline">&larr; Back to Home</span>
          <span className="sm:hidden">&larr; Back</span>
        </Link>
        <div className="flex-shrink-0">
          <ResponsiveHeader />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Data We Collect</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            When you create an account and use Pinball Brackets, we collect:
          </p>
          <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1">
            <li>Email address (for authentication)</li>
            <li>Display name (shown on leaderboards)</li>
            <li>Your bracket predictions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">How We Use Your Data</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            Your data is used to:
          </p>
          <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1">
            <li>Authenticate you and maintain your session</li>
            <li>Store and display your bracket predictions</li>
            <li>Calculate and display leaderboard rankings</li>
            <li>Display your name on public brackets (if you choose to make them public)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1">
            <li>
              <strong>Supabase</strong> - For authentication and database storage.
              Your email and data are stored securely on Supabase servers.
            </li>
            <li>
              <strong>Vercel</strong> - For hosting the application.
              Standard server logs may be collected.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Public vs Private Brackets</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            When you create a bracket, you can choose to make it public or private:
          </p>
          <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1">
            <li>
              <strong>Public brackets</strong> are visible to anyone and appear on the leaderboard
              with your display name
            </li>
            <li>
              <strong>Private brackets</strong> are only visible to you and do not appear
              on the public leaderboard
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Your account and bracket data are retained as long as you maintain your account.
          </p>
        </section>

      </div>
    </main>
  );
}
