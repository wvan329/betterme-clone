import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emailSchema } from '@/lib/schemas';

// POST /api/user/email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = emailSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email },
    });

    return NextResponse.json({
      success: true,
      email: user.email,
    });

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: (error as any).errors },
        { status: 400 },
      );
    }
    console.error('POST /api/user/email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
