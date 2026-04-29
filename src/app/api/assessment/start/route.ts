import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sessionStartSchema } from '@/lib/schemas';

// POST /api/assessment/start
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = sessionStartSchema.parse(body);

    // 查找已有用户
    let user = await prisma.user.findUnique({
      where: { sessionId },
      include: {
        assessments: {
          where: { status: 'IN_PROGRESS' },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (user) {
      // 已有用户：检查是否有进行中的测评
      const activeAssessment = user.assessments[0];

      if (activeAssessment) {
        // 有进行中的测评 → 返回进度恢复信息
        return NextResponse.json({
          userId: user.id,
          currentStep: activeAssessment.currentStep,
          status: 'IN_PROGRESS',
          isNew: false,
        }, { status: 200 });
      }

      // 没有进行中的测评（可能已完成或从未开始）→ 创建新测评
      await prisma.assessment.create({
        data: {
          userId: user.id,
          currentStep: 1,
          status: 'IN_PROGRESS',
        },
      });

      return NextResponse.json({
        userId: user.id,
        currentStep: 1,
        status: 'IN_PROGRESS',
        isNew: true,
      }, { status: 201 });
    }

    // 全新用户：创建 User + Assessment + Subscription
    user = await prisma.user.create({
      data: {
        sessionId,
        assessments: {
          create: {
            currentStep: 1,
            status: 'IN_PROGRESS',
          },
        },
        subscription: {
          create: {
            status: 'INACTIVE',
          },
        },
      },
      include: {
        assessments: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({
      userId: user.id,
      currentStep: 1,
      status: 'IN_PROGRESS',
      isNew: true,
    }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: (error as any).errors }, { status: 400 });
    }
    console.error('POST /api/assessment/start error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
