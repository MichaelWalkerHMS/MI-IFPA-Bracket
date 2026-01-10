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
        <h1 className="text-3xl font-bold mb-6">About</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">What is this?</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            This is something I wanted for myself, and I figured there may be a few other pinball
            players that would like to make some brackets too.
          </p>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            My name is Michael Walker - I{"'"}m a pinball player in Michigan that{"'"}s getting ready
            for my first State Championship tournament this January. Last year, I was frustrated
            when I couldn{"'"}t find an easy, free way to fill out a prediction bracket while I
            watched my friends play in the IFPA State Championship tournament.
          </p>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            This year, I had a little time to kill over the Christmas break and decided to finally
            give Claude Code a try and see what the hype is about. This site is the result of that
            side project. I gave the direction and iterated through bug fixes/design/etc., but all
            code was created by Anthropic{"'"}s Claude Code terminal/agent. It{"'"}s been fun.
          </p>
          <p className="text-[rgb(var(--color-text-secondary))]">
            All code is visible on{" "}
            <a
              href="https://github.com/MichaelWalkerHMS/MI-IFPA-Bracket"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[rgb(var(--color-accent-primary))] hover:underline"
            >
              GitHub
            </a>
            {" "}- I am going to continue to make frequent changes as I find things that I want to
            improve or as I receive feedback. Visit the{" "}
            <Link
              href="/changelog"
              className="text-[rgb(var(--color-accent-primary))] hover:underline"
            >
              changelog
            </Link>
            {" "}for recent changes and future ideas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">How it works</h2>
          <ol className="list-decimal list-outside ml-6 text-[rgb(var(--color-text-secondary))] space-y-2">
            <li>
              Select a tournament from the available state championships - in the beginning, it may
              only be Michigan. I expect to expand to other states in the future (it{"'"}s the
              results that are the hard part).
            </li>
            <li>Create your bracket by predicting the winner of each match</li>
            <li>Submit your bracket before the tournament locks</li>
            <li>Watch the tournament - you{"'"}ll get points for how well you predict the results</li>
            <li>Check the leaderboard to see how you compare to others</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Scoring</h2>
          <p className="text-[rgb(var(--color-text-secondary))] mb-4">
            Points are awarded for each correct prediction, with later rounds worth more points.
          </p>
          <p className="font-semibold mb-1">24-player tournaments (53 points max):</p>
          <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1 mb-4">
            <li>Opening Round: 1 point</li>
            <li>Round of 16: 2 points</li>
            <li>Quarterfinals: 3 points</li>
            <li>Semifinals: 4 points</li>
            <li>Finals: 5 points</li>
            <li>3rd/4th Place: 4 points</li>
          </ul>
          <p className="font-semibold mb-1">16-player tournaments (29 points max):</p>
          <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1">
            <li>Round of 16: 1 point</li>
            <li>Quarterfinals: 2 points</li>
            <li>Semifinals: 3 points</li>
            <li>Finals: 4 points</li>
            <li>3rd/4th Place: 3 points</li>
          </ul>
        </section>

        <section className="mb-8 p-4 bg-[rgb(var(--color-bg-secondary))] rounded-lg border border-[rgb(var(--color-border-primary))]">
          <h2 className="text-xl font-semibold mb-3">Disclaimer</h2>
          <p className="text-[rgb(var(--color-text-secondary))]">
            This application is not officially affiliated with the IFPA (International Flipper Pinball Association), nor is it sponsored or approved by them. It{"'"}s just a fun project, that{"'"}s all.
          </p>
        </section>
      </div>
    </main>
  );
}
