"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBracket, countUserBracketsForTournament } from "@/app/tournament/[id]/actions";

interface PendingBracketCreation {
  tournamentId: string;
  tournamentState: string;
  tournamentYear: number;
  timestamp: number;
}

interface PendingBracketHandlerProps {
  userId: string;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export default function PendingBracketHandler({ userId }: PendingBracketHandlerProps) {
  const router = useRouter();
  const hasHandled = useRef(false);

  useEffect(() => {
    // Prevent running twice (React strict mode)
    if (hasHandled.current) return;

    async function handlePendingBracket() {
      // Check sessionStorage for pending bracket creation
      const pendingDataStr = sessionStorage.getItem("pendingBracketCreation");
      if (!pendingDataStr) return;

      try {
        const pendingData: PendingBracketCreation = JSON.parse(pendingDataStr);

        // Validate expiration (1 hour)
        const age = Date.now() - pendingData.timestamp;
        if (age > ONE_HOUR_MS) {
          sessionStorage.removeItem("pendingBracketCreation");
          return;
        }

        // Mark as handled to prevent duplicate processing
        hasHandled.current = true;

        // Clear sessionStorage immediately to prevent re-processing on navigation
        sessionStorage.removeItem("pendingBracketCreation");

        // Generate bracket name: {state} {year} #{count + 1}
        const count = await countUserBracketsForTournament(pendingData.tournamentId);
        const bracketName = `${pendingData.tournamentState} ${pendingData.tournamentYear} #${count + 1}`;

        // Create the bracket
        const result = await createBracket(pendingData.tournamentId, bracketName);

        if (result.error) {
          console.error("Failed to create bracket:", result.error);
          return;
        }

        if (result.bracket) {
          // Redirect to bracket editor
          router.push(`/bracket/${result.bracket.id}/edit`);
        }
      } catch (error) {
        console.error("Error handling pending bracket:", error);
        sessionStorage.removeItem("pendingBracketCreation");
      }
    }

    handlePendingBracket();
  }, [router, userId]);

  // This component doesn't render anything
  return null;
}
