"use client";

import { useState } from "react";
import type { Tournament, TournamentFormData } from "@/lib/types";

interface TournamentFormProps {
  tournament?: Tournament; // If provided, we're editing
  onSubmit: (data: TournamentFormData) => Promise<{ error?: string }>;
  onCancel: () => void;
}

export default function TournamentForm({
  tournament,
  onSubmit,
  onCancel,
}: TournamentFormProps) {
  const isEditing = !!tournament;

  // Initialize form state
  const [formData, setFormData] = useState<TournamentFormData>({
    name: tournament?.name || "",
    state: tournament?.state || "MI",
    year: tournament?.year || new Date().getFullYear(),
    lock_date: tournament?.lock_date
      ? formatDateTimeLocal(tournament.lock_date)
      : "",
    start_date: tournament?.start_date
      ? formatDateTimeLocal(tournament.start_date)
      : "",
    end_date: tournament?.end_date
      ? formatDateTimeLocal(tournament.end_date)
      : "",
    player_count: (tournament?.player_count as 16 | 24) || 24,
    timezone: tournament?.timezone || "America/New_York",
    matchplay_id: tournament?.matchplay_id || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function formatDateTimeLocal(isoString: string): string {
    const date = new Date(isoString);
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit(formData);
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tournament Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Tournament Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="2026 Michigan State Championship"
          required
        />
      </div>

      {/* State and Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            State
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value.toUpperCase() })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="MI"
            maxLength={2}
            required
          />
        </div>
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Year
          </label>
          <input
            type="number"
            id="year"
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={2020}
            max={2030}
            required
          />
        </div>
      </div>

      {/* Player Count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Player Count
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="player_count"
              value={24}
              checked={formData.player_count === 24}
              onChange={() => setFormData({ ...formData, player_count: 24 })}
              className="w-4 h-4"
            />
            <span>24 players</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="player_count"
              value={16}
              checked={formData.player_count === 16}
              onChange={() => setFormData({ ...formData, player_count: 16 })}
              className="w-4 h-4"
            />
            <span>16 players</span>
          </label>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="lock_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Predictions Lock
          </label>
          <input
            type="datetime-local"
            id="lock_date"
            value={formData.lock_date}
            onChange={(e) =>
              setFormData({ ...formData, lock_date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="datetime-local"
            id="start_date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="end_date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            type="datetime-local"
            id="end_date"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label
          htmlFor="timezone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Timezone
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) =>
            setFormData({ ...formData, timezone: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>

      {/* MatchPlay ID (optional) */}
      <div>
        <label
          htmlFor="matchplay_id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          MatchPlay ID{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          id="matchplay_id"
          value={formData.matchplay_id}
          onChange={(e) =>
            setFormData({ ...formData, matchplay_id: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 12345"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Tournament"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
