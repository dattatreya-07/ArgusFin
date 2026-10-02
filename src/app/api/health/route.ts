import { NextResponse } from 'next/server';
import { getSystemReadiness } from '@/lib/readiness';

export async function GET() {
  try {
    const readiness = getSystemReadiness();
    return NextResponse.json(readiness, {
      status: readiness.overallStatus === 'HEALTHY' ? 200 : 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'System health probe encountered an error.',
        },
      },
      { status: 500 }
    );
  }
}
