import { assistantFlow } from '@/ai/flows/assistant-flow';
import { NextRequest, NextResponse } from 'next/server';
import { Message, Part } from 'genkit';
import { ai } from '@/ai/genkit';

export async function POST(req: NextRequest) {
  const { history } = await req.json();

  const mappedHistory = history.map((msg: any) => new Message(msg.role, [new Part({text: msg.content})]));

  const { stream } = ai.generateStream({
    history: mappedHistory,
    prompt: 'Continue the conversation and be helpful.',
  });

  const webStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          controller.enqueue(text);
        }
      }
      controller.close();
    },
  });

  return new Response(webStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
