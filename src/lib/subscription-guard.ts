import { prisma } from './prisma';

export interface GuardResult {
  authorized: boolean;
  subscription: {
    status: string;
    planType: string | null;
    startDate: Date | null;
    endDate: Date | null;
    isExpired: boolean;
  } | null;
}

/**
 * 校验用户订阅状态
 * - ACTIVE 且在有效期内 → authorized
 * - 其他状态 → unauthorized
 */
export async function requireSubscription(userId: string): Promise<GuardResult> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) {
    return {
      authorized: false,
      subscription: null,
    };
  }

  const now = new Date();
  const isExpired = sub.endDate ? now > sub.endDate : false;

  // 如果已过期但状态仍是 ACTIVE，自动更新
  if (isExpired && sub.status === 'ACTIVE') {
    await prisma.subscription.update({
      where: { userId },
      data: { status: 'EXPIRED' },
    });
    sub.status = 'EXPIRED';
  }

  return {
    authorized: sub.status === 'ACTIVE' && !isExpired,
    subscription: {
      status: sub.status,
      planType: sub.planType,
      startDate: sub.startDate,
      endDate: sub.endDate,
      isExpired,
    },
  };
}
