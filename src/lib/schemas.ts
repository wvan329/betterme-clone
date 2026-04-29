import { z } from 'zod';

// ─── 通用 ───
export const userIdSchema = z.object({
  userId: z.string().uuid(),
});

export const sessionStartSchema = z.object({
  sessionId: z.string().uuid(),
});

// ─── 每步数据校验 ───

export const stepDataSchemas: Record<number, z.ZodSchema> = {
  1: z.object({
    ageRange: z.enum(['18-29', '30-39', '40-49', '50+']),
  }),

  2: z.object({
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  }),

  3: z.object({
    dailyActivity: z.enum(['SITTING', 'ACTIVE_BREAKS', 'ON_FEET']),
  }),

  4: z.object({
    energyLevel: z.enum(['HIGH_STEADY', 'DRAGGING', 'POST_LUNCH_SLUMP', 'LOW_TIRED']),
  }),

  5: z.object({
    waterIntake: z.enum(['COFFEE_TEA_ONLY', 'TWO_GLASSES', 'TWO_TO_SIX', 'MORE_THAN_SIX']),
  }),

  6: z.object({
    sleepHours: z.enum(['LESS_THAN_5', 'FIVE_TO_SIX', 'SEVEN_TO_EIGHT', 'MORE_THAN_8']),
  }),

  7: z.object({
    breakfastTime: z.enum(['SIX_TO_EIGHT', 'EIGHT_TO_TEN', 'TEN_TO_NOON', 'SKIP']),
  }),

  8: z.object({
    lunchTime: z.enum(['TEN_TO_NOON', 'NOON_TO_TWO', 'TWO_TO_FOUR', 'SKIP']),
  }),

  9: z.object({
    dinnerTime: z.enum(['FOUR_TO_SIX', 'SIX_TO_EIGHT', 'EIGHT_TO_TEN', 'SKIP']),
  }),

  10: z.object({
    dietType: z.enum([
      'TRADITIONAL', 'KETO', 'PALEO',
      'VEGETARIAN', 'VEGAN', 'KETO_VEGAN',
      'MEDITERRANEAN', 'PESCATARIAN',
      'LACTOSE_FREE', 'GLUTEN_FREE',
    ]),
  }),

  11: z.object({
    badHabits: z.array(
      z.enum(['LATE_EATING', 'SUGAR', 'SODA', 'TOO_MUCH_SALT', 'NONE'])
    ).min(1),
  }),

  12: z.object({
    lifeEvents: z.array(
      z.enum(['MARRIAGE', 'BUSY_WORK', 'FINANCIAL', 'STRESS', 'AGING', 'NONE'])
    ).min(1),
  }),

  13: z.object({
    upcomingEvent: z.enum([
      'VACATION', 'WEDDING', 'HOLIDAY', 'SPORTING',
      'REUNION', 'BIRTHDAY', 'OTHER', 'NONE',
    ]),
  }),

  14: z.object({
    height: z.number().min(90).max(250),
    weight: z.number().min(25).max(300),
  }),

  15: z.object({
    goalWeight: z.number().min(25).max(300),
    targetAge: z.number().int().min(13).max(100),
  }),
};

// ─── 保存步骤的完整请求体 ───
export const saveStepRequestSchema = z.object({
  userId: z.string().uuid(),
  step: z.number().int().min(1).max(15),
  data: z.record(z.unknown()),
});

// ─── 邮箱 ───
export const emailSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().max(255),
});

// ─── 姓名 ───
export const nameSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
});

// ─── 支付 ───
export const paySchema = z.object({
  userId: z.string().uuid(),
  planType: z.enum(['ONE_WEEK_TRIAL', 'FOUR_WEEK', 'TWELVE_WEEK']),
});

// ─── 工具函数 ───
export function validateStepData(step: number, data: unknown) {
  const schema = stepDataSchemas[step];
  if (!schema) {
    throw new Error(`Invalid step: ${step}. Valid range: 1-15`);
  }
  return schema.parse(data);
}
