"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import TournamentForm from "@/components/admin/TournamentForm";
import { createTournament } from "@/app/admin/actions";
import type { TournamentFormData } from "@/lib/types";

export default function NewTournamentPage() {
  const router = useRouter();

  async function handleSubmit(data: TournamentFormData) {
    const result = await createTournament(data);

    if (result.error) {
      return { error: result.error };
    }

    // Redirect to the tournament admin page
    if (result.tournament) {
      router.push(`/admin/tournament/${result.tournament.id}`);
    }

    return {};
  }

  function handleCancel() {
    router.push("/admin");
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-[rgb(var(--color-accent-primary))] hover:underline text-sm"
        >
          &larr; Back to Tournaments
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">New Tournament</h1>
        <p className="text-[rgb(var(--color-text-secondary))] mt-1">
          Create a new tournament for bracket predictions
        </p>
      </div>

      {/* Form */}
      <div className="bg-[rgb(var(--color-bg-primary))] rounded-lg border border-[rgb(var(--color-border-primary))] p-6 max-w-2xl">
        <TournamentForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
