// ─── 健康评估计算器 ───

export interface AssessmentInput {
  gender: string;
  height: number;      // cm
  weight: number;      // kg
  goalWeight: number;  // kg
  targetAge: number;
  dailyActivity: string;
  dietType: string;
  sleepHours: string;
}

export interface WeightChartPoint {
  week: number;
  weight: number;
}

export interface HealthResult {
  bmi: number;
  bmiCategory: string;
  bodyType: string;
  fitnessLevel: string;
  metabolism: string;
  suggestedCalories: number;
  targetDate: string;       // ISO date string
  predictedWeight: number;
  weightChart: WeightChartPoint[];
}

/**
 * 计算 BMI
 */
export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
}

/**
 * BMI 分类（亚洲标准偏保守）
 */
export function calcBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'UNDERWEIGHT';
  if (bmi < 24.0) return 'NORMAL';
  if (bmi < 28.0) return 'OVERWEIGHT';
  return 'OBESE';
}

/**
 * 基础代谢 BMR（Mifflin-St Jeor 公式）
 */
export function calcBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
): number {
  if (gender === 'MALE') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

/**
 * 每日总能量消耗 TDEE
 */
export function calcTDEE(bmr: number, activity: string): number {
  const multiplier: Record<string, number> = {
    SITTING: 1.2,
    ACTIVE_BREAKS: 1.375,
    ON_FEET: 1.55,
  };
  return Math.round(bmr * (multiplier[activity] || 1.2));
}

/**
 * 建议摄入热量（减重 = TDEE - 500，不低于 1200）
 */
export function calcSuggestedCalories(tdee: number): number {
  return Math.max(1200, tdee - 500);
}

/**
 * 预测目标日期
 * 安全减重速度：每周 0.5-1.0 kg，取 0.75
 */
export function calcTargetDate(currentWeight: number, goalWeight: number): Date {
  const weeklyLoss = 0.75;
  const diff = currentWeight - goalWeight;
  if (diff <= 0) {
    // 维持或增重场景：4周
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return d;
  }
  const weeksNeeded = Math.ceil(diff / weeklyLoss);
  const d = new Date();
  d.setDate(d.getDate() + weeksNeeded * 7);
  return d;
}

/**
 * 预测4周后体重
 */
export function calcPredictedWeight(currentWeight: number, goalWeight: number): number {
  const weeklyLoss = 0.75;
  const diff = currentWeight - goalWeight;
  if (diff <= 0) return currentWeight;
  return +(currentWeight - weeklyLoss * 4).toFixed(1);
}

/**
 * 生成4周体重图表
 */
export function calcWeightChart(currentWeight: number): WeightChartPoint[] {
  const weeklyLoss = 0.75;
  return Array.from({ length: 5 }, (_, week) => ({
    week,
    weight: +(currentWeight - weeklyLoss * week).toFixed(1),
  }));
}

/**
 * 推断体态类型
 */
export function calcBodyType(bmi: number): string {
  if (bmi < 20) return 'ECTOMORPH';
  if (bmi < 25) return 'MESOMORPH';
  return 'ENDOMORPH';
}

/**
 * 推断健身水平
 */
export function calcFitnessLevel(activity: string): string {
  const map: Record<string, string> = {
    SITTING: 'BEGINNER',
    ACTIVE_BREAKS: 'INTERMEDIATE',
    ON_FEET: 'ADVANCED',
  };
  return map[activity] || 'BEGINNER';
}

/**
 * 推断代谢水平
 */
export function calcMetabolism(bmi: number): string {
  if (bmi < 22) return 'FAST';
  if (bmi < 27) return 'MODERATE';
  return 'SLOW';
}

/**
 * 主入口：计算完整健康评估结果
 */
export function calculateHealthProfile(input: AssessmentInput): HealthResult {
  const bmi = calcBMI(input.weight, input.height);
  const bmiCategory = calcBMICategory(bmi);
  const bodyType = calcBodyType(bmi);
  const fitnessLevel = calcFitnessLevel(input.dailyActivity);
  const metabolism = calcMetabolism(bmi);

  const bmr = calcBMR(input.weight, input.height, input.targetAge, input.gender);
  const tdee = calcTDEE(bmr, input.dailyActivity);
  const suggestedCalories = calcSuggestedCalories(tdee);

  const targetDate = calcTargetDate(input.weight, input.goalWeight);
  const predictedWeight = calcPredictedWeight(input.weight, input.goalWeight);
  const weightChart = calcWeightChart(input.weight);

  return {
    bmi,
    bmiCategory,
    bodyType,
    fitnessLevel,
    metabolism,
    suggestedCalories,
    targetDate: targetDate.toISOString(),
    predictedWeight,
    weightChart,
  };
}
