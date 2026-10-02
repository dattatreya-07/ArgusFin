import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Channel {
  type: string;
  value: string;
  verified_at: string | null;
  notes?: string;
}

interface Authority {
  id: string;
  name: string;
  scope: string;
  channels: Channel[];
  verified_at: string | null;
  source_url: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'authorities.json');
    const fileData = await fs.readFile(filePath, 'utf-8');
    const allAuthorities: Authority[] = JSON.parse(fileData);

    const { searchParams } = new URL(req.url);
    const archetype = searchParams.get('archetype');

    // Filter channels: ONLY include channels where verified_at is non-null
    const sanitizedAuthorities = allAuthorities.map((auth) => ({
      ...auth,
      channels: (auth.channels || []).filter(
        (ch) => ch.verified_at !== null && ch.verified_at !== undefined && ch.verified_at !== ''
      ),
    }));

    return NextResponse.json(
      {
        authorities: sanitizedAuthorities,
        filteredByArchetype: archetype ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to load authorities data' } },
      { status: 500 }
    );
  }
}
