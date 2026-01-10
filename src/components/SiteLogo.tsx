import Link from "next/link";

interface SiteLogoProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show as a link to home */
  asLink?: boolean;
}

/**
 * Reusable site logo/title component.
 * Links to homepage when clicked.
 */
export default function SiteLogo({ size = "md", asLink = true }: SiteLogoProps) {
  const sizeClasses = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl md:text-3xl",
    lg: "text-2xl sm:text-3xl md:text-4xl",
  };

  const content = (
    <span className={`${sizeClasses[size]} font-bold`}>Pinball Brackets</span>
  );

  if (asLink) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
