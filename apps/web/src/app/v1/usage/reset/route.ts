import { NextRequest, NextResponse } from 'next/server';
import { creditManager } from '@/lib/ai-engine';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-secret',
    },
  });
}

function handleReset(req: NextRequest) {
  const env = process.env.NODE_ENV || 'development';
  const adminSecret = process.env.ADMIN_RESET_SECRET || '';
  const headerSecret = req.headers.get('x-admin-secret') || '';

  if (env === 'production' && adminSecret && headerSecret !== adminSecret) {
    return NextResponse.json(
      { detail: 'Credit reset is restricted in production without admin secret.' },
      { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const updatedInfo = creditManager.resetCredits();
  return NextResponse.json(updatedInfo, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(req: NextRequest) {
  return handleReset(req);
}

export async function GET(req: NextRequest) {
  return handleReset(req);
}
