import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BracketStatusBadge from "@/components/dashboard/BracketStatusBadge";

describe("BracketStatusBadge", () => {
  describe("when bracket is complete", () => {
    it("renders Ready badge", () => {
      render(<BracketStatusBadge isComplete={true} />);

      expect(screen.getByText("Ready")).toBeInTheDocument();
    });

    it("has success styling classes", () => {
      render(<BracketStatusBadge isComplete={true} />);

      const badge = screen.getByText("Ready");
      expect(badge).toHaveClass("bg-[rgb(var(--color-success-bg))]");
      expect(badge).toHaveClass("text-[rgb(var(--color-success-text))]");
    });
  });

  describe("when bracket is incomplete", () => {
    it("renders Incomplete badge", () => {
      render(<BracketStatusBadge isComplete={false} />);

      expect(screen.getByText("Incomplete")).toBeInTheDocument();
    });

    it("has warning styling classes", () => {
      render(<BracketStatusBadge isComplete={false} />);

      const badge = screen.getByText("Incomplete");
      expect(badge).toHaveClass("bg-[rgb(var(--color-warning-bg))]");
      expect(badge).toHaveClass("text-[rgb(var(--color-warning-text))]");
    });
  });
});
