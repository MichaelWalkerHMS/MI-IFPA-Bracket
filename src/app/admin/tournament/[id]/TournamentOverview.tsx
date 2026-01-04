"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Tournament, TournamentFormData } from "@/lib/types";
import TournamentForm from "@/components/admin/TournamentForm";
import {
  updateTournament,
  updateTournamentStatus,
  toggleTournamentVisibility,
  deleteTournament,
} from "@/app/admin/actions";

interface TournamentOverviewProps {
  tournament: Tournament;
  bracketCount: number;
}

export default function TournamentOverview({
  tournament,
  bracketCount,
}: TournamentOverviewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format dates for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  async function handleUpdate(data: TournamentFormData) {
    const result = await updateTournament(tournament.id, data);
    if (result.error) {
      return { error: result.error };
    }
    setIsEditing(false);
    router.refresh();
    return {};
  }

  async function handleStatusChange(
    status: "upcoming" | "in_progress" | "completed"
  ) {
    setError(null);
    const result = await updateTournamentStatus(tournament.id, status);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleVisibilityToggle() {
    setError(null);
    const result = await toggleTournamentVisibility(tournament.id);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this tournament? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteTournament(tournament.id);
    if (result.error) {
      setError(result.error);
      setIsDeleting(false);
    } else {
      router.push("/admin");
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Edit Tournament
        </h2>
        <TournamentForm
          tournament={tournament}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tournament Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">State</dt>
            <dd className="font-medium">{tournament.state}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Year</dt>
            <dd className="font-medium">{tournament.year}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Player Count</dt>
            <dd className="font-medium">{tournament.player_count}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Timezone</dt>
            <dd className="font-medium">{tournament.timezone}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Predictions Lock</dt>
            <dd className="font-medium">{formatDate(tournament.lock_date)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Start Date</dt>
            <dd className="font-medium">{formatDate(tournament.start_date)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">End Date</dt>
            <dd className="font-medium">{formatDate(tournament.end_date)}</dd>
          </div>
          {tournament.matchplay_id && (
            <div>
              <dt className="text-sm text-gray-500">MatchPlay ID</dt>
              <dd className="font-medium">{tournament.matchplay_id}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Status & Visibility Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Status & Visibility
        </h2>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="text-sm text-gray-500 block mb-2">
              Tournament Status
            </label>
            <div className="flex gap-2">
              {(["upcoming", "in_progress", "completed"] as const).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      tournament.status === status
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-sm text-gray-500 block mb-2">
              Public Visibility
            </label>
            <button
              onClick={handleVisibilityToggle}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tournament.is_active
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tournament.is_active ? "Visible to Public" : "Hidden from Public"}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-gray-600 text-sm mb-4">
          Deleting a tournament will remove all associated players. Brackets
          must be deleted separately first.
        </p>
        <button
          onClick={handleDelete}
          disabled={isDeleting || bracketCount > 0}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "Deleting..." : "Delete Tournament"}
        </button>
        {bracketCount > 0 && (
          <p className="text-sm text-red-600 mt-2">
            Cannot delete: {bracketCount} bracket(s) exist for this tournament.
          </p>
        )}
      </div>
    </div>
  );
}
