import Link from "next/link";
import ResponsiveHeader from "@/components/ResponsiveHeader";

export default function ChangelogPage() {
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
        <h1 className="text-3xl font-bold mb-6">Changelog</h1>

        <p className="text-[rgb(var(--color-text-secondary))]">
          Coming soon - check back for recent changes and future ideas.
        </p>
      </div>
    </main>
  );
}
