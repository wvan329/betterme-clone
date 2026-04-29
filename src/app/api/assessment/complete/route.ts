import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userIdSchema } from '@/lib/schemas';
import { calculateHealthProfile } from '@/lib/health-calculator';

// POST /api/assessment/complete
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = userIdSchema.parse(body);

    // 查找测评记录
    const assessment = await prisma.assessment.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { updatedAt: 'desc' },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'No active assessment found' },
        { status: 404 },
      );
    }

    // 确保所有必填步骤已完成（step 15 = 最后一步）
    if (assessment.currentStep < 15) {
      return NextResponse.json(
        {
          error: 'Assessment not complete',
          currentStep: assessment.currentStep,
          stepsRemaining: 15 - assessment.currentStep,
        },
        { status: 400 },
      );
    }

    // 确保关键字段不为空
    const requiredFields = ['height', 'weight', 'goalWeight', 'targetAge', 'gender', 'dailyActivity'];
    const missing = requiredFields.filter(f => assessment[f as keyof typeof assessment] == null);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missing },
        { status: 400 },
      );
    }

    // 执行健康评估计算
    const result = calculateHealthProfile({
      gender: assessment.gender!,
      height: assessment.height!,
      weight: assessment.weight!,
      goalWeight: assessment.goalWeight!,
      targetAge: assessment.targetAge!,
      dailyActivity: assessment.dailyActivity!,
      dietType: assessment.dietType || 'TRADITIONAL',
      sleepHours: assessment.sleepHours || 'SEVEN_TO_EIGHT',
    });

    // 转为纯 JSON 对象（消除 TypeScript 类型索引签名问题）
    const rawData = JSON.parse(JSON.stringify(result));

    // 事务：写入结果 + 标记完成
    const [healthProfile] = await prisma.$transaction([
      prisma.healthProfile.upsert({
        where: { userId },
        create: {
          userId,
          bmi: result.bmi,
          bmiCategory: result.bmiCategory,
          bodyType: result.bodyType,
          fitnessLevel: result.fitnessLevel,
          metabolism: result.metabolism,
          suggestedCalories: result.suggestedCalories,
          targetDate: new Date(result.targetDate),
          predictedWeight: result.predictedWeight,
          rawData,
        },
        update: {
          bmi: result.bmi,
          bmiCategory: result.bmiCategory,
          bodyType: result.bodyType,
          fitnessLevel: result.fitnessLevel,
          metabolism: result.metabolism,
          suggestedCalories: result.suggestedCalories,
          targetDate: new Date(result.targetDate),
          predictedWeight: result.predictedWeight,
          rawData,
        },
      }),
      prisma.assessment.update({
        where: { id: assessment.id },
        data: { status: 'COMPLETED', currentStep: 15 },
      }),
    ]);

    return NextResponse.json({
      success: true,
      healthProfileId: healthProfile.id,
    }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 },
      );
    }
    console.error('POST /api/assessment/complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
