import { assistantFlow } from '@/ai/flows/assistant-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.history) {
      return NextResponse.json({ error: 'History is required' }, { status: 400 });
    }

    // Pass only the history array to the flow
    const response = await assistantFlow({ history: body.history });

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
