import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subscription?userId={uuid}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const now = new Date();
    const isExpired = sub.endDate ? now > sub.endDate : false;

    return NextResponse.json({
      status: isExpired ? 'EXPIRED' : sub.status,
      planType: sub.planType,
      startDate: sub.startDate?.toISOString() || null,
      endDate: sub.endDate?.toISOString() || null,
      isExpired,
    });

  } catch (error) {
    console.error('GET /api/subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
