import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants/navigation";

/**
 * Shared navigation links component for header areas.
 * Displays About and FAQ links styled as subtle menu buttons.
 */
export default function NavLinks() {
  return (
    <nav className="flex items-center gap-1">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-3 py-1.5 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-tertiary))] rounded-lg transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
