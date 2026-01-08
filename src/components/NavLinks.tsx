import Link from "next/link";

/**
 * Shared navigation links component for header areas.
 * Displays About and FAQ links styled as subtle menu buttons.
 */
export default function NavLinks() {
  return (
    <nav className="flex items-center gap-1">
      <Link
        href="/about"
        className="px-3 py-1.5 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
      >
        About
      </Link>
      <Link
        href="/faq"
        className="px-3 py-1.5 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
      >
        FAQ
      </Link>
    </nav>
  );
}
