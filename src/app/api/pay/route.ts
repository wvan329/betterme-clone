import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paySchema } from '@/lib/schemas';

// 计划时长映射（天数）
const PLAN_DURATIONS: Record<string, number> = {
  ONE_WEEK_TRIAL: 7,
  FOUR_WEEK: 28,
  TWELVE_WEEK: 84,
};

// POST /api/pay
// 模拟支付：直接激活订阅
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, planType } = paySchema.parse(body);

    // 检查用户是否存在
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 确保订阅记录存在
    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Subscription record not found' }, { status: 404 });
    }

    const now = new Date();
    const durationDays = PLAN_DURATIONS[planType] || 28;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 模拟支付成功 → 激活订阅
    const subscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
        planType,
        startDate: now,
        endDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully (simulated)',
      subscription: {
        status: subscription.status,
        planType: subscription.planType,
        startDate: subscription.startDate?.toISOString(),
        endDate: subscription.endDate?.toISOString(),
      },
    });

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 },
      );
    }
    console.error('POST /api/pay error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
