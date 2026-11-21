import { NextResponse } from 'next/server';
import journeysData from '@/data/geo/journeys.json';

export async function GET() {
  return NextResponse.json(journeysData);
}
