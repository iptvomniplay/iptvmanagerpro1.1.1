'use server';
/**
 * @fileOverview A simple conversational AI flow for the virtual assistant.
 *
 * - assistantFlow - A function that takes a chat history and returns a response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Message, Part } from 'genkit';

export const AssistantInputSchema = z.object({
  history: z.array(z.any()), // Using `any` to accommodate the flexible Message type
});

export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export async function assistantFlow(
  input: AssistantInput
): Promise<string> {
    
  const history = input.history.map((msg: any) => new Message(msg.role, msg.parts.map((p: any) => new Part(p))));

  const response = await ai.generate({
    history: history,
    prompt: 'Continue the conversation.',
  });

  return response.text;
}
