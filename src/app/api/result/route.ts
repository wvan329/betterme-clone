import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSubscription } from '@/lib/subscription-guard';

// GET /api/result?userId={uuid}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    // 校验 UUID 格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    // 获取健康评估结果
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (!healthProfile) {
      return NextResponse.json(
        { error: 'Health profile not found. Please complete the assessment first.' },
        { status: 404 },
      );
    }

    // 获取用户订阅状态
    const { authorized, subscription } = await requireSubscription(userId);

    // 用户姓名
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // ─── 非会员：仅返回摘要数据 ───
    if (!authorized) {
      return NextResponse.json({
        type: 'RESTRICTED',
        userName: user?.name || null,
        subscription,
        summary: {
          bmi: healthProfile.bmi,
          bmiCategory: healthProfile.bmiCategory,
          bodyType: healthProfile.bodyType,
          fitnessLevel: healthProfile.fitnessLevel,
        },
        lockedMessage: '解锁完整计划，查看您的专属目标预测日期与个性化营养方案',
        upgradePlans: [
          {
            id: 'ONE_WEEK_TRIAL',
            name: '1周试用 · 4周计划',
            price: 6.93,
            originalPrice: 17.77,
            discount: 61,
            description: '首周体验价',
          },
          {
            id: 'FOUR_WEEK',
            name: '4周计划',
            price: 15.19,
            originalPrice: 38.95,
            discount: 61,
            tag: '最受欢迎',
            description: '首4周优惠价',
          },
          {
            id: 'TWELVE_WEEK',
            name: '12周计划',
            price: 36.99,
            originalPrice: 94.85,
            discount: 61,
            description: '首12周优惠价',
          },
        ],
      });
    }

    // ─── 会员：返回完整数据 ───
    const rawData = healthProfile.rawData as Record<string, unknown> | null;

    return NextResponse.json({
      type: 'FULL',
      userName: user?.name || null,
      subscription,
      summary: {
        bmi: healthProfile.bmi,
        bmiCategory: healthProfile.bmiCategory,
        bodyType: healthProfile.bodyType,
        fitnessLevel: healthProfile.fitnessLevel,
        metabolism: healthProfile.metabolism,
      },
      detail: {
        suggestedCalories: healthProfile.suggestedCalories,
        targetDate: healthProfile.targetDate.toISOString(),
        predictedWeight: healthProfile.predictedWeight,
        weightChart: rawData?.weightChart || null,
      },
    });

  } catch (error) {
    console.error('GET /api/result error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
