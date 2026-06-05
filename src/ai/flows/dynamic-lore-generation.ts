/**
 * @fileOverview A mock lore generator for static deployments.
 * Replaces live Genkit flows to stay within the Firebase Spark (Free) Plan.
 * 
 * IMPORTANT: This file must NOT contain 'use server' to remain compatible with static export.
 */

const LORE_LIBRARY = [
  "The stars are not just light; they are memories of a civilization that mastered the warp before time began.",
  "Neural link stability detected at 98%. The whispers of the void are becoming clearer.",
  "Ancient logs suggest this sector was once the cradle of the first Supernova.",
  "A fragment of cosmic history: the Stellar Shards were forged in the heart of a dying giant.",
  "Observation: The nebulae in this sector appear to be breathing in sync with the player's link.",
  "Status Report: Energy levels are fluctuating. The cosmic alignment is nearly complete.",
  "Legend says those who match the Rainbow Core gain sight beyond the event horizon.",
  "The Black Hole effect is not a vacuum, but a gateway to a parallel sector.",
  "Tactical Note: Celestial entities respond to the rhythm of the match-3 sequence.",
  "The archive records a moment of perfect symmetry that occurred ten thousand years ago."
];

export type DynamicLoreGenerationInput = {
  gameEventDescription: string;
  gameContext?: string;
};

export type DynamicLoreGenerationOutput = {
  loreSnippet: string;
};

export async function generateDynamicLore(
  input: DynamicLoreGenerationInput
): Promise<DynamicLoreGenerationOutput> {
  // Select a random lore snippet from the library
  const randomIndex = Math.floor(Math.random() * LORE_LIBRARY.length);
  return {
    loreSnippet: LORE_LIBRARY[randomIndex],
  };
}