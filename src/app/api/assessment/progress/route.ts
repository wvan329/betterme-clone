import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 不需要保存到 filledData 的元字段
const META_FIELDS = new Set([
  'id', 'userId', 'currentStep', 'status',
  'createdAt', 'updatedAt',
]);

// GET /api/assessment/progress?userId={uuid}
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

    const assessment = await prisma.assessment.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { updatedAt: 'desc' },
    });

    if (!assessment) {
      // 检查是否有已完成的测评
      const completed = await prisma.assessment.findFirst({
        where: { userId, status: 'COMPLETED' },
      });
      if (completed) {
        return NextResponse.json({
          userId,
          currentStep: completed.currentStep,
          status: 'COMPLETED',
          filledData: null,
        });
      }
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // 提取已填写字段（非 null 且非元字段）
    const filledData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(assessment)) {
      if (value !== null && !META_FIELDS.has(key)) {
        filledData[key] = value;
      }
    }

    return NextResponse.json({
      userId,
      currentStep: assessment.currentStep,
      status: assessment.status,
      filledData,
    });

  } catch (error) {
    console.error('GET /api/assessment/progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
