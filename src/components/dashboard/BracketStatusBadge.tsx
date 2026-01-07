interface BracketStatusBadgeProps {
  isComplete: boolean;
}

export default function BracketStatusBadge({ isComplete }: BracketStatusBadgeProps) {
  if (isComplete) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--color-success-bg))] text-[rgb(var(--color-success-text))] border border-[rgb(var(--color-success-icon))]">
        Ready
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgb(var(--color-warning-bg))] text-[rgb(var(--color-warning-text))] border border-[rgb(var(--color-warning-border))]">
      Incomplete
    </span>
  );
}
