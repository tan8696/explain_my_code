import { NextRequest, NextResponse } from 'next/server';
import { explainCode } from '@/lib/ai-engine';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.code !== 'string') {
      return NextResponse.json(
        { detail: 'No code provided in request body.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const code = body.code.trim();
    if (!code) {
      return NextResponse.json(
        { detail: 'No code provided.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (code.length > 50_000) {
      return NextResponse.json(
        { detail: 'Code exceeds maximum length (50,000 characters).' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const explanation = await explainCode(code);

    return NextResponse.json(explanation, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error in /v1/explain route handler:', error);
    return NextResponse.json(
      { detail: error?.message || 'Failed to generate code explanation.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
