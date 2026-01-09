import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import MyBracketsTable from "@/components/dashboard/MyBracketsTable";
import type { DashboardBracket } from "@/lib/types";

const mockBrackets: DashboardBracket[] = [
  {
    id: "bracket-1",
    name: "My First Bracket",
    tournament_id: "tournament-1",
    tournament_name: "2026 Michigan State Championship",
    tournament_state: "Michigan",
    tournament_year: 2026,
    player_count: 24,
    lock_date: "2026-01-17T12:00:00Z",
    tournament_status: "in_progress",
    pick_count: 24,
    expected_picks: 24,
    is_complete: true,
    is_public: true,
    score: 42,
    rank: 3,
    is_locked: false,
  },
  {
    id: "bracket-2",
    name: "Second Try",
    tournament_id: "tournament-1", // Same tournament as bracket-1
    tournament_name: "2026 Michigan State Championship",
    tournament_state: "Michigan",
    tournament_year: 2026,
    player_count: 24,
    lock_date: "2026-01-17T12:00:00Z",
    tournament_status: "in_progress",
    pick_count: 10,
    expected_picks: 24,
    is_complete: false,
    is_public: false, // Private bracket
    score: 0,
    rank: null,
    is_locked: false,
  },
  {
    id: "bracket-3",
    name: "Championship Pick",
    tournament_id: "tournament-2", // Different tournament
    tournament_name: "2025 Indiana State Championship",
    tournament_state: "Indiana",
    tournament_year: 2025,
    player_count: 16,
    lock_date: "2025-01-15T12:00:00Z",
    tournament_status: "completed",
    pick_count: 16,
    expected_picks: 16,
    is_complete: true,
    is_public: true,
    score: 28,
    rank: 5,
    is_locked: true,
  },
];

describe("MyBracketsTable", () => {
  describe("when brackets exist", () => {
    it("groups brackets by tournament", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // Should show tournament names as group headers
      expect(screen.getByText("2026 Michigan State Championship")).toBeInTheDocument();
      expect(screen.getByText("2025 Indiana State Championship")).toBeInTheDocument();
    });

    it("shows bracket count per tournament", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // Michigan has 2 brackets, Indiana has 1 bracket
      // Text is split across elements, so we use a function matcher
      expect(screen.getByText((_, element) => {
        return element?.textContent === "24 players · 2 brackets";
      })).toBeInTheDocument();
      expect(screen.getByText((_, element) => {
        return element?.textContent === "16 players · 1 bracket";
      })).toBeInTheDocument();
    });

    it("shows player count in tournament header", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      expect(screen.getByText(/24 players/)).toBeInTheDocument();
      expect(screen.getByText(/16 players/)).toBeInTheDocument();
    });

    it("renders bracket names as clickable links", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const firstBracketLink = screen.getByRole("link", { name: "My First Bracket" });
      expect(firstBracketLink).toHaveAttribute("href", "/bracket/bracket-1");

      const secondBracketLink = screen.getByRole("link", { name: "Second Try" });
      expect(secondBracketLink).toHaveAttribute("href", "/bracket/bracket-2");
    });

    it("renders status badges for each bracket", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // 2 complete (Ready), 1 incomplete
      const readyBadges = screen.getAllByText("Ready");
      const incompleteBadges = screen.getAllByText("Incomplete");

      expect(readyBadges).toHaveLength(2);
      expect(incompleteBadges).toHaveLength(1);
    });

    it("renders rank for ranked brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // Rank text is split across elements for responsive display
      // Mobile shows "#3", desktop shows "Rank #3"
      expect(screen.getByText("3")).toBeInTheDocument(); // Rank value
      expect(screen.getByText("5")).toBeInTheDocument(); // Rank value
    });

    it("renders scores for scored brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // Score text is split across elements for responsive display
      // Mobile shows "42", desktop shows "42 pts"
      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("28")).toBeInTheDocument();
    });

    it("renders Private badge for private brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // Only bracket-2 is private (is_public: false)
      const privateBadges = screen.getAllByText("Private");
      expect(privateBadges).toHaveLength(1);
    });

    it("renders Edit button for unlocked brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const editButtons = screen.getAllByRole("link", { name: "Edit" });
      // Only unlocked brackets (2 of 3) should have Edit buttons
      expect(editButtons).toHaveLength(2);
    });

    it("renders View button for all brackets", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const viewButtons = screen.getAllByRole("link", { name: "View" });
      expect(viewButtons).toHaveLength(3);
    });

    it("renders Leaderboard button for each tournament group", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const leaderboardButtons = screen.getAllByRole("link", { name: "Leaderboard" });
      // One per tournament group (2 tournaments)
      expect(leaderboardButtons).toHaveLength(2);
    });

    it("links Edit buttons to correct URLs", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const editButtons = screen.getAllByRole("link", { name: "Edit" });
      expect(editButtons[0]).toHaveAttribute("href", "/bracket/bracket-1/edit");
      expect(editButtons[1]).toHaveAttribute("href", "/bracket/bracket-2/edit");
    });

    it("links Leaderboard buttons to correct tournament URLs", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      const leaderboardButtons = screen.getAllByRole("link", { name: "Leaderboard" });
      expect(leaderboardButtons[0]).toHaveAttribute("href", "/tournament/tournament-1");
      expect(leaderboardButtons[1]).toHaveAttribute("href", "/tournament/tournament-2");
    });
  });

  describe("collapsible behavior", () => {
    it("starts with all tournaments expanded", () => {
      render(<MyBracketsTable brackets={mockBrackets} />);

      // All bracket names should be visible
      expect(screen.getByText("My First Bracket")).toBeVisible();
      expect(screen.getByText("Second Try")).toBeVisible();
      expect(screen.getByText("Championship Pick")).toBeVisible();
    });

    it("collapses tournament when header is clicked", async () => {
      const user = userEvent.setup();
      render(<MyBracketsTable brackets={mockBrackets} />);

      // Click on Michigan tournament header
      const michiganHeader = screen.getByText("2026 Michigan State Championship").closest("button");
      expect(michiganHeader).toBeInTheDocument();

      await user.click(michiganHeader!);

      // Michigan brackets should be hidden
      expect(screen.queryByText("My First Bracket")).not.toBeInTheDocument();
      expect(screen.queryByText("Second Try")).not.toBeInTheDocument();

      // Indiana bracket should still be visible
      expect(screen.getByText("Championship Pick")).toBeVisible();
    });

    it("expands tournament when collapsed header is clicked again", async () => {
      const user = userEvent.setup();
      render(<MyBracketsTable brackets={mockBrackets} />);

      const michiganHeader = screen.getByText("2026 Michigan State Championship").closest("button");

      // Collapse
      await user.click(michiganHeader!);
      expect(screen.queryByText("My First Bracket")).not.toBeInTheDocument();

      // Expand again
      await user.click(michiganHeader!);
      expect(screen.getByText("My First Bracket")).toBeVisible();
    });
  });

  describe("when no brackets exist", () => {
    it("renders empty state message", () => {
      render(<MyBracketsTable brackets={[]} />);

      expect(screen.getByText("You haven't created any brackets yet.")).toBeInTheDocument();
      expect(screen.getByText("Use the form below to create your first bracket!")).toBeInTheDocument();
    });

    it("does not render tournament groups", () => {
      render(<MyBracketsTable brackets={[]} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
