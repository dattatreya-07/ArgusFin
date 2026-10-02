import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'ladder.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const ladderData = JSON.parse(fileData);

    return NextResponse.json(ladderData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to load ladder data' } },
      { status: 500 }
    );
  }
}
