import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nameSchema } from '@/lib/schemas';

// POST /api/user/name
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name } = nameSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      name: user.name,
    });

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 },
      );
    }
    console.error('POST /api/user/name error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
