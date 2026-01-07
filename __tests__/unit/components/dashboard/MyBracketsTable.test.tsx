import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MyBracketsTable from "@/components/dashboard/MyBracketsTable";
import type { DashboardBracket } from "@/lib/types";

const mockBrackets: DashboardBracket[] = [
  {
    id: "bracket-1",
    name: "My First Bracket",
    tournament_id: "tournament-1",
    tournament_name: "Michigan 2026 State Championship",
    tournament_state: "Michigan",
    tournament_year: 2026,
    player_count: 24,
    lock_date: "2026-01-17T12:00:00Z",
    tournament_status: "in_progress",
    pick_count: 24,
    expected_picks: 24,
    is_complete: true,
    score: 42,
    rank: 3,
    is_locked: false,
  },
  {
    id: "bracket-2",
    name: null,
    tournament_id: "tournament-2",
    tournament_name: "Ohio 2026 State Championship",
    tournament_state: "Ohio",
    tournament_year: 2026,
    player_count: 24,
    lock_date: "2026-02-01T12:00:00Z",
    tournament_status: "upcoming",
    pick_count: 10,
    expected_picks: 24,
    is_complete: false,
    score: 0,
    rank: null,
    is_locked: false,
  },
  {
    id: "bracket-3",
    name: "Championship Pick",
    tournament_id: "tournament-3",
    tournament_name: "Indiana 2025 State Championship",
    tournament_state: "Indiana",
    tournament_year: 2025,
    player_count: 16,
    lock_date: "2025-01-15T12:00:00Z",
    tournament_status: "completed",
    pick_count: 16,
    expected_picks: 16,
    is_complete: true,
    score: 28,
    rank: 5,
    is_locked: true,
  },
];

describe("MyBracketsTable", () => {
  describe("when brackets exist", () => {
    it("renders table headers", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      expect(screen.getByText("Tournament")).toBeInTheDocument();
      expect(screen.getByText("Players")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Rank")).toBeInTheDocument();
      expect(screen.getByText("Score")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("renders bracket tournament info", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      expect(screen.getByText("Michigan 2026")).toBeInTheDocument();
      expect(screen.getByText("Ohio 2026")).toBeInTheDocument();
      expect(screen.getByText("Indiana 2025")).toBeInTheDocument();
    });

    it("renders bracket names when available", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      expect(screen.getByText("My First Bracket")).toBeInTheDocument();
      expect(screen.getByText("Championship Pick")).toBeInTheDocument();
    });

    it("renders player counts", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // All three have player counts displayed
      const playerCounts = screen.getAllByText(/\d+ players/);
      expect(playerCounts).toHaveLength(3);
    });

    it("renders status badges", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // 2 complete, 1 incomplete
      const readyBadges = screen.getAllByText("Ready");
      const incompleteBadges = screen.getAllByText("Incomplete");

      expect(readyBadges).toHaveLength(2);
      expect(incompleteBadges).toHaveLength(1);
    });

    it("renders ranks for ranked brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      expect(screen.getByText("#3")).toBeInTheDocument();
      expect(screen.getByText("#5")).toBeInTheDocument();
    });

    it("renders scores for scored brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      expect(screen.getByText("42 pts")).toBeInTheDocument();
      expect(screen.getByText("28 pts")).toBeInTheDocument();
    });

    it("renders Edit link for unlocked brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const editLinks = screen.getAllByText("Edit");
      // Only unlocked brackets (2 of 3) should have Edit links
      expect(editLinks).toHaveLength(2);
    });

    it("renders View link for all brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const viewLinks = screen.getAllByText("View");
      expect(viewLinks).toHaveLength(3);
    });

    it("renders Leaderboard link for all brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const leaderboardLinks = screen.getAllByText("Leaderboard");
      expect(leaderboardLinks).toHaveLength(3);
    });

    it("links to correct bracket edit URLs", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const editLinks = screen.getAllByRole("link", { name: "Edit" });
      expect(editLinks[0]).toHaveAttribute("href", "/bracket/bracket-1/edit");
      expect(editLinks[1]).toHaveAttribute("href", "/bracket/bracket-2/edit");
    });

    it("links to correct bracket view URLs", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const viewLinks = screen.getAllByRole("link", { name: "View" });
      expect(viewLinks[0]).toHaveAttribute("href", "/bracket/bracket-1");
      expect(viewLinks[1]).toHaveAttribute("href", "/bracket/bracket-2");
      expect(viewLinks[2]).toHaveAttribute("href", "/bracket/bracket-3");
    });

    it("links to correct tournament leaderboard URLs", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const leaderboardLinks = screen.getAllByRole("link", { name: "Leaderboard" });
      expect(leaderboardLinks[0]).toHaveAttribute("href", "/tournament/tournament-1");
      expect(leaderboardLinks[1]).toHaveAttribute("href", "/tournament/tournament-2");
      expect(leaderboardLinks[2]).toHaveAttribute("href", "/tournament/tournament-3");
    });
  });

  describe("when no brackets exist", () => {
    it("renders empty state message", () => {
      render(<MyBracketsTable brackets={[]} />);

      expect(screen.getByText("You haven't created any brackets yet.")).toBeInTheDocument();
      expect(screen.getByText("Use the form below to create your first bracket!")).toBeInTheDocument();
    });

    it("does not render table", () => {
      render(<MyBracketsTable brackets={[]} />);

      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });
});
