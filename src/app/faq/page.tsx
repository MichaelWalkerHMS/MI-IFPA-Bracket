import Link from "next/link";
import SettingsButton from "@/components/SettingsButton";
import AuthHeader from "@/components/AuthHeader";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "How does scoring work?",
    answer: (
      <>
        <p className="mb-2">
          Points are awarded for each correct prediction, with later rounds worth more points:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Opening Round: 1 point</li>
          <li>Round of 16: 2 points</li>
          <li>Quarterfinals: 3 points</li>
          <li>Semifinals: 4 points</li>
          <li>Finals: 5 points</li>
          <li>3rd/4th Place: 4 points</li>
        </ul>
        <p className="mt-2">
          The maximum possible score for a 24-player tournament is 53 points.
        </p>
      </>
    ),
  },
  {
    question: "What happens when a tournament locks?",
    answer:
      "Once a tournament is locked by an administrator, no new brackets can be created and existing brackets cannot be modified. This typically happens just before the tournament begins to ensure all predictions are final.",
  },
  {
    question: "What's the difference between public and private brackets?",
    answer:
      "Public brackets are visible to everyone and appear on the tournament leaderboard with your display name. Private brackets are only visible to you and won't appear on the public leaderboard. You can toggle this setting when creating your bracket.",
  },
  {
    question: "How are ties broken on the leaderboard?",
    answer: (
      <>
        <p className="mb-2">When multiple players have the same score, ties are broken in order by:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Correctly predicted the champion (yes beats no)</li>
          <li>Game score accuracy (closer to actual game scores is better)</li>
          <li>Total number of correct predictions (more is better)</li>
        </ol>
      </>
    ),
  },
  {
    question: "Can I create multiple brackets for the same tournament?",
    answer:
      "Yes, you can create multiple brackets for each tournament. This allows you to try different prediction strategies or create brackets with friends.",
  },
  {
    question: "Can I edit my bracket after submitting?",
    answer:
      "Yes, you can edit your bracket predictions at any time before the tournament is locked. Once locked, all brackets become final.",
  },
  {
    question: "What is IFPA?",
    answer: (
      <>
        The International Flipper Pinball Association (IFPA) is the governing body for competitive
        pinball worldwide. They maintain player rankings and sanction tournaments globally. Learn
        more at{" "}
        <a
          href="https://www.ifpapinball.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[rgb(var(--color-accent-primary))] hover:underline"
        >
          ifpapinball.com
        </a>
        .
      </>
    ),
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <Link href="/" className="text-[rgb(var(--color-accent-primary))] hover:underline">
          &larr; Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <SettingsButton />
          <AuthHeader />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <section
              key={index}
              className="p-4 border border-[rgb(var(--color-border-primary))] rounded-lg bg-[rgb(var(--color-bg-primary))]"
            >
              <h2 className="text-lg font-semibold mb-2">{faq.question}</h2>
              <div className="text-[rgb(var(--color-text-secondary))]">{faq.answer}</div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
