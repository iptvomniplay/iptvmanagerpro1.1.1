'use server';
/**
 * @fileOverview A simple conversational AI flow for the virtual assistant.
 *
 * - assistantFlow - A function that takes a chat history and returns a response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const AssistantInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ),
});

export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export async function assistantFlow(
  input: AssistantInput
): Promise<string> {

  // The history from the client is already in a compatible format.
  // We just need to map it to ensure it matches the exact structure Genkit expects.
  const history = input.history.map((msg) => ({
    role: msg.role,
    content: [{ text: msg.content }],
  }));

  const response = await ai.generate({
    history: history,
    prompt: 'Continue the conversation.',
  });

  return response.text;
}
