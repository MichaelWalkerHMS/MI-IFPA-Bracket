"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Verify the current user is an admin.
 */
async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Not authorized" };
  }

  return { user };
}

/**
 * Bulk import players for a tournament.
 * Replaces all existing players with the new list.
 */
export async function bulkImportPlayers(
  tournamentId: string,
  names: string[]
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();

  // Verify tournament exists
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, player_count")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return { error: "Tournament not found" };
  }

  // Validate player count
  if (names.length > tournament.player_count) {
    return {
      error: `Too many players. Maximum is ${tournament.player_count}.`,
    };
  }

  // Check if there are existing brackets - if so, we need to log the seeding change
  const { count: bracketCount } = await supabase
    .from("brackets")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  // Delete existing players
  const { error: deleteError } = await supabase
    .from("players")
    .delete()
    .eq("tournament_id", tournamentId);

  if (deleteError) {
    console.error("Error deleting existing players:", deleteError);
    return { error: "Failed to clear existing players" };
  }

  // Insert new players
  const playersToInsert = names.map((name, index) => ({
    tournament_id: tournamentId,
    name: name.trim(),
    seed: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("players")
    .insert(playersToInsert);

  if (insertError) {
    console.error("Error inserting players:", insertError);
    return { error: "Failed to insert players" };
  }

  // Log seeding change if brackets exist
  if (bracketCount && bracketCount > 0) {
    const affectedSeeds = names.map((_, i) => i + 1);
    await supabase.from("seeding_change_log").insert({
      tournament_id: tournamentId,
      changed_by: auth.user.id,
      change_type: "bulk_import",
      affected_seeds: affectedSeeds,
      description: `Bulk imported ${names.length} players`,
    });
  }

  revalidatePath(`/admin/tournament/${tournamentId}`);
  return { success: true, count: names.length };
}

/**
 * Update a single player's name
 */
export async function updatePlayerName(playerId: string, name: string) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();

  // Get the player to find tournament ID
  const { data: player, error: fetchError } = await supabase
    .from("players")
    .select("tournament_id, name, seed")
    .eq("id", playerId)
    .single();

  if (fetchError || !player) {
    return { error: "Player not found" };
  }

  const oldName = player.name;

  // Update player name
  const { error: updateError } = await supabase
    .from("players")
    .update({ name: name.trim() })
    .eq("id", playerId);

  if (updateError) {
    console.error("Error updating player name:", updateError);
    return { error: "Failed to update player name" };
  }

  // Log seeding change
  await supabase.from("seeding_change_log").insert({
    tournament_id: player.tournament_id,
    changed_by: auth.user.id,
    change_type: "rename",
    affected_seeds: [player.seed],
    description: `Renamed seed ${player.seed}: "${oldName}" → "${name.trim()}"`,
  });

  revalidatePath(`/admin/tournament/${player.tournament_id}`);
  return { success: true };
}

/**
 * Delete a player and shift seeds below up
 */
export async function deletePlayer(playerId: string) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();

  // Get the player to find tournament ID and seed
  const { data: player, error: fetchError } = await supabase
    .from("players")
    .select("tournament_id, name, seed")
    .eq("id", playerId)
    .single();

  if (fetchError || !player) {
    return { error: "Player not found" };
  }

  const deletedSeed = player.seed;
  const tournamentId = player.tournament_id;

  // Get all players with higher seeds
  const { data: higherPlayers } = await supabase
    .from("players")
    .select("id, seed")
    .eq("tournament_id", tournamentId)
    .gt("seed", deletedSeed)
    .order("seed", { ascending: true });

  // Delete the player
  const { error: deleteError } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  if (deleteError) {
    console.error("Error deleting player:", deleteError);
    return { error: "Failed to delete player" };
  }

  // Shift seeds up for all players below
  if (higherPlayers && higherPlayers.length > 0) {
    for (const p of higherPlayers) {
      await supabase
        .from("players")
        .update({ seed: p.seed - 1 })
        .eq("id", p.id);
    }
  }

  // Calculate affected seeds (deleted seed and all below)
  const affectedSeeds = [deletedSeed];
  if (higherPlayers) {
    affectedSeeds.push(...higherPlayers.map((p) => p.seed));
  }

  // Log seeding change
  await supabase.from("seeding_change_log").insert({
    tournament_id: tournamentId,
    changed_by: auth.user.id,
    change_type: "delete",
    affected_seeds: affectedSeeds,
    description: `Deleted "${player.name}" (was seed ${deletedSeed}). Seeds ${deletedSeed + 1}+ shifted up.`,
  });

  revalidatePath(`/admin/tournament/${tournamentId}`);
  return { success: true };
}

/**
 * Add a new player at a specific seed position
 */
export async function addPlayer(
  tournamentId: string,
  name: string,
  seed: number
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();

  // Verify tournament exists and check player count
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("player_count")
    .eq("id", tournamentId)
    .single();

  if (tournamentError || !tournament) {
    return { error: "Tournament not found" };
  }

  // Get current player count
  const { count: currentCount } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId);

  if (currentCount && currentCount >= tournament.player_count) {
    return { error: "Tournament is already at maximum player capacity" };
  }

  // Shift seeds down for all players at or below the new seed position
  const { data: playersToShift } = await supabase
    .from("players")
    .select("id, seed")
    .eq("tournament_id", tournamentId)
    .gte("seed", seed)
    .order("seed", { ascending: false }); // Start from highest to avoid conflicts

  if (playersToShift && playersToShift.length > 0) {
    for (const p of playersToShift) {
      await supabase
        .from("players")
        .update({ seed: p.seed + 1 })
        .eq("id", p.id);
    }
  }

  // Insert new player
  const { error: insertError } = await supabase.from("players").insert({
    tournament_id: tournamentId,
    name: name.trim(),
    seed,
  });

  if (insertError) {
    console.error("Error inserting player:", insertError);
    return { error: "Failed to add player" };
  }

  // Calculate affected seeds
  const affectedSeeds = [seed];
  if (playersToShift) {
    affectedSeeds.push(...playersToShift.map((p) => p.seed + 1));
  }

  // Log seeding change
  await supabase.from("seeding_change_log").insert({
    tournament_id: tournamentId,
    changed_by: auth.user.id,
    change_type: "add",
    affected_seeds: affectedSeeds,
    description: `Added "${name.trim()}" at seed ${seed}. Seeds ${seed}+ shifted down.`,
  });

  revalidatePath(`/admin/tournament/${tournamentId}`);
  return { success: true };
}

/**
 * Reorder players by providing the new order
 */
export async function reorderPlayers(
  tournamentId: string,
  newOrder: Array<{ id: string; seed: number }>
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();

  // Get current order to determine affected seeds
  const { data: currentPlayers } = await supabase
    .from("players")
    .select("id, seed, name")
    .eq("tournament_id", tournamentId)
    .order("seed", { ascending: true });

  if (!currentPlayers) {
    return { error: "Failed to fetch current players" };
  }

  // Find which seeds changed
  const affectedSeeds: number[] = [];
  for (const newPlayer of newOrder) {
    const current = currentPlayers.find((p) => p.id === newPlayer.id);
    if (current && current.seed !== newPlayer.seed) {
      affectedSeeds.push(current.seed, newPlayer.seed);
    }
  }

  // Remove duplicates
  const uniqueAffectedSeeds = [...new Set(affectedSeeds)].sort((a, b) => a - b);

  if (uniqueAffectedSeeds.length === 0) {
    return { success: true }; // No changes
  }

  // Delete all players and re-insert with new order
  // (This avoids unique constraint issues during reordering)
  const { error: deleteError } = await supabase
    .from("players")
    .delete()
    .eq("tournament_id", tournamentId);

  if (deleteError) {
    console.error("Error deleting players for reorder:", deleteError);
    return { error: "Failed to reorder players" };
  }

  // Build new player list maintaining names
  const playerMap = new Map(currentPlayers.map((p) => [p.id, p]));
  const playersToInsert = newOrder.map((item) => {
    const player = playerMap.get(item.id);
    return {
      tournament_id: tournamentId,
      name: player?.name || "Unknown",
      seed: item.seed,
    };
  });

  const { error: insertError } = await supabase
    .from("players")
    .insert(playersToInsert);

  if (insertError) {
    console.error("Error inserting reordered players:", insertError);
    return { error: "Failed to save new player order" };
  }

  // Log seeding change
  await supabase.from("seeding_change_log").insert({
    tournament_id: tournamentId,
    changed_by: auth.user.id,
    change_type: "reorder",
    affected_seeds: uniqueAffectedSeeds,
    description: `Reordered players. Seeds affected: ${uniqueAffectedSeeds.join(", ")}`,
  });

  revalidatePath(`/admin/tournament/${tournamentId}`);
  return { success: true };
}
