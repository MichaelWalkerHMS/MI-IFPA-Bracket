import Link from "next/link";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import FAQAccordion from "@/components/FAQAccordion";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: "How does scoring work?",
    answer: (
      <>
        <p className="mb-3">
          Points are awarded for each correct prediction, with later rounds worth more points.
        </p>
        <p className="font-semibold mb-1">24-player tournaments (53 points max):</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>Opening Round: 1 point</li>
          <li>Round of 16: 2 points</li>
          <li>Quarterfinals: 3 points</li>
          <li>Semifinals: 4 points</li>
          <li>Finals: 5 points</li>
          <li>3rd/4th Place: 4 points</li>
        </ul>
        <p className="font-semibold mb-1">16-player tournaments (29 points max):</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Round of 16: 1 point</li>
          <li>Quarterfinals: 2 points</li>
          <li>Semifinals: 3 points</li>
          <li>Finals: 4 points</li>
          <li>3rd/4th Place: 3 points</li>
        </ul>
      </>
    ),
  },
  {
    question: "What happens when a tournament locks?",
    answer:
      "Tournaments lock at approximately the start time of the tournament; from that time on, all brackets are final and cannot be changed.",
  },
  {
    question: "What's the difference between public and private brackets?",
    answer: (
      <>
        <p className="mb-2">
          I get it - maybe you don{"'"}t want your friend to know that you think they{"'"}re going to lose in the first round.
        </p>
        <p className="mb-2">
          Or maybe you{"'"}d like to have one public bracket and one private one where you predict you{"'"}ll be the one to win the championship.
        </p>
        <p className="mb-2">
          Or maybe you{"'"}d just prefer to keep things anonymous and off the leaderboard.
        </p>
        <p>
          No matter why, that{"'"}s the reason private exists - they are visible only to you and do not appear on the public leaderboard. You can toggle this back and forth at any time on the bracket page, including after creation.
        </p>
      </>
    ),
  },
  {
    question: "How are ties broken on the leaderboard?",
    answer: (
      <>
        <p className="mb-2">If multiple brackets end up tied with the same score, ties are broken in this order:</p>
        <ol className="list-decimal list-inside space-y-3">
          <li>Correctly predicted the champion (yes beats no)</li>
          <li>
            <span>For the championship match, who predicted the best-of-7 more accurately?</span>
            <p className="mt-2 ml-5 text-sm">Uses sum of differences. Example:</p>
            <div className="mt-2 ml-5 text-sm font-mono bg-[rgb(var(--color-bg-secondary))] p-3 rounded overflow-x-auto">
              <p className="mb-2">Actual match result: Player C wins 4-3</p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[rgb(var(--color-border-primary))]">
                    <th className="py-1 pr-4">Prediction</th>
                    <th className="py-1 pr-4">Winner Diff</th>
                    <th className="py-1 pr-4">Loser Diff</th>
                    <th className="py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[rgb(var(--color-border-primary))]">
                    <td className="py-1 pr-4">You: 4-2</td>
                    <td className="py-1 pr-4">|4-4| = 0</td>
                    <td className="py-1 pr-4">|3-2| = 1</td>
                    <td className="py-1 font-semibold">1</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">Friend: 4-0</td>
                    <td className="py-1 pr-4">|4-4| = 0</td>
                    <td className="py-1 pr-4">|3-0| = 3</td>
                    <td className="py-1 font-semibold">3</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2">You = 1, Friend = 3. Lower is better, so you win the tiebreaker.</p>
            </div>
          </li>
          <li>Final tiebreaker: Total number of correct predictions (more is better)</li>
        </ol>
      </>
    ),
  },
  {
    question: "Can I create multiple brackets for the same tournament?",
    answer: "Yes, you can create as many brackets per tournament as you'd like.",
  },
  {
    question: "Can I edit my bracket after submitting?",
    answer:
      "Yes, you can edit your bracket predictions at any time before the tournament is locked. Once locked, all brackets become final.",
  },
];

export default function FAQPage() {
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
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        <FAQAccordion items={faqs} />
      </div>
    </main>
  );
}
