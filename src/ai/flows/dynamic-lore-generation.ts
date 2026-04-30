'use server';
/**
 * @fileOverview A Genkit flow for generating dynamic lore snippets in the Stellar Shift game.
 *
 * - generateDynamicLore - A function that handles the dynamic lore generation process.
 * - DynamicLoreGenerationInput - The input type for the generateDynamicLore function.
 * - DynamicLoreGenerationOutput - The return type for the generateDynamicLore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicLoreGenerationInputSchema = z.object({
  gameEventDescription: z
    .string()
    .describe(
      'A descriptive string of the game event or milestone that triggered the lore generation (e.g., "Achieved first Supernova", "Completed Level 5", "Triggered a Black Hole effect").'
    ),
  gameContext: z
    .string()
    .optional()
    .describe(
      'Optional additional context about the game state or elements involved in the event (e.g., "Matched with Stellar Shards and Nebulae", "Spaceship energy at 80%").'
    ),
});
export type DynamicLoreGenerationInput = z.infer<
  typeof DynamicLoreGenerationInputSchema
>;

const DynamicLoreGenerationOutputSchema = z.object({
  loreSnippet: z
    .string()
    .describe('A short, thematic lore snippet (1-3 sentences) related to the game event.'),
});
export type DynamicLoreGenerationOutput = z.infer<
  typeof DynamicLoreGenerationOutputSchema
>;

export async function generateDynamicLore(
  input: DynamicLoreGenerationInput
): Promise<DynamicLoreGenerationOutput> {
  return dynamicLoreGenerationFlow(input);
}

const dynamicLorePrompt = ai.definePrompt({
  name: 'dynamicLorePrompt',
  input: {schema: DynamicLoreGenerationInputSchema},
  output: {schema: DynamicLoreGenerationOutputSchema},
  prompt: `You are a cosmic storyteller for the game Stellar Shift. Your task is to generate a short, immersive lore snippet (like an ancient rune description, a spaceship status report, a fragment of cosmic history, or a mysterious observation) based on a significant game event. The lore should enhance the player's immersion and feel thematic to space, stars, and celestial bodies, aligning with the game's aesthetic.

Game Event: {{{gameEventDescription}}}
{{#if gameContext}}
Additional Context: {{{gameContext}}}
{{/if}}

Generate a concise and evocative lore snippet (1-3 sentences):
`,
});

const dynamicLoreGenerationFlow = ai.defineFlow(
  {
    name: 'dynamicLoreGenerationFlow',
    inputSchema: DynamicLoreGenerationInputSchema,
    outputSchema: DynamicLoreGenerationOutputSchema,
  },
  async input => {
    const {output} = await dynamicLorePrompt(input);
    return output!;
  }
);
