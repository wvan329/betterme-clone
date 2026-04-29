import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveStepRequestSchema, validateStepData } from '@/lib/schemas';

// POST /api/assessment/save-step
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 基础校验
    const { userId, step, data } = saveStepRequestSchema.parse(body);

    // 校验该步骤的数据内容
    const validatedData = validateStepData(step, data);

    // 查找当前测评记录
    const assessment = await prisma.assessment.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { updatedAt: 'desc' },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'No active assessment found. Please start a new session.' },
        { status: 404 },
      );
    }

    // 防止跳步：只能保存 currentStep+1 或重新保存当前步骤
    if (step > assessment.currentStep + 1) {
      return NextResponse.json(
        { error: `Cannot skip steps. Current step: ${assessment.currentStep}, attempted: ${step}` },
        { status: 409 },
      );
    }

    // 更新
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        ...validatedData,
        currentStep: step,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      currentStep: step,
    });

  } catch (error: unknown) {
    // 返回具体错误信息以便调试
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('save-step error:', message, error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 },
      );
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
