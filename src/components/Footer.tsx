import Link from "next/link";

/**
 * Shared footer component displayed at the bottom of all pages.
 * Contains privacy policy link and copyright.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-4 border-t border-[rgb(var(--color-border-primary))]">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-[rgb(var(--color-text-muted))]">
        <span>&copy; {currentYear} Pinball Brackets</span>
        <Link
          href="/privacy"
          className="hover:text-[rgb(var(--color-accent-primary))] hover:underline"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
