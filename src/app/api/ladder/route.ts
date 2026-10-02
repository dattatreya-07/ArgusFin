import { NextResponse } from 'next/server';
import { loadLadderModel } from '@/lib/ladder';

export async function GET() {
  try {
    const ladderData = await loadLadderModel();
    return NextResponse.json(ladderData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to load ladder data' } },
      { status: 500 }
    );
  }
}
