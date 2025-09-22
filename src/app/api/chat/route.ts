import { assistantFlow } from '@/ai/flows/assistant-flow';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json();

    if (!history) {
      return NextResponse.json({ error: 'History is required' }, { status: 400 });
    }

    const response = await assistantFlow({ history });

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
