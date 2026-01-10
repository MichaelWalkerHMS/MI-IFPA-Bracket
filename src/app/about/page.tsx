import Link from "next/link";
import ResponsiveHeader from "@/components/ResponsiveHeader";

export default function AboutPage() {
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
        <h1 className="text-3xl font-bold mb-6">About Pinball Brackets</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">What is this?</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            Pinball Brackets is a fun, community-driven tool for competitive pinball
            enthusiasts to predict the outcomes of IFPA (International Flipper Pinball Association)
            State Championship tournaments.
          </p>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Before the tournament begins, create your bracket predictions and see how your
            pinball knowledge stacks up against other fans on the leaderboard.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">How it works</h2>
          <ol className="list-decimal list-inside text-[rgb(var(--color-text-secondary))] space-y-2">
            <li>Select a tournament from the available state championships</li>
            <li>Create your bracket by predicting the winner of each match</li>
            <li>Submit your bracket before the tournament locks</li>
            <li>Watch the tournament and earn points for correct predictions</li>
            <li>Check the leaderboard to see how you compare to others</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Scoring</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            Points are awarded for each correct prediction, with later rounds worth more:
          </p>
          <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1">
            <li>Opening Round: 1 point per correct pick</li>
            <li>Round of 16: 2 points per correct pick</li>
            <li>Quarterfinals: 3 points per correct pick</li>
            <li>Semifinals: 4 points per correct pick</li>
            <li>Finals: 5 points for the correct champion</li>
            <li>3rd/4th Place: 4 points</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">About IFPA</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            The International Flipper Pinball Association (IFPA) is the governing body for
            competitive pinball worldwide. They maintain player rankings and sanction tournaments
            across the globe.
          </p>
          <p className="text-[rgb(var(--color-text-secondary))]">
            Learn more at{" "}
            <a
              href="https://www.ifpapinball.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgb(var(--color-accent-primary))] hover:underline"
            >
              ifpapinball.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
