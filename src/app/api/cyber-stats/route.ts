import { NextResponse } from 'next/server';
import { loadCyberFraudModel } from '@/lib/cyber-stats';

export async function GET() {
  const model = await loadCyberFraudModel();
  return NextResponse.json(model);
}
