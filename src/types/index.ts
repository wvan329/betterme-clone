// ─── 共享类型定义 ───

export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  details?: unknown;
  [key: string]: T | string | boolean | undefined | unknown;
}

// 测评相关
export interface AssessmentProgress {
  userId: string;
  currentStep: number;
  status: string;
  filledData: Record<string, unknown> | null;
}

// 步骤数据结构
export interface StepData {
  [key: string]: unknown;
}

// 测评启动响应
export interface StartResponse {
  userId: string;
  currentStep: number;
  status: string;
  isNew: boolean;
}

// 结果页数据
export interface ResultSummary {
  bmi: number;
  bmiCategory: string;
  bodyType: string;
  fitnessLevel: string;
  metabolism?: string;
}

export interface ResultDetail {
  suggestedCalories: number;
  targetDate: string;
  predictedWeight: number;
  weightChart: { week: number; weight: number }[] | null;
}

export interface UpgradePlan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  tag?: string;
  description?: string;
}

export interface ResultResponse {
  type: 'RESTRICTED' | 'FULL';
  userName: string | null;
  subscription: {
    status: string;
    planType: string | null;
    startDate: string | null;
    endDate: string | null;
    isExpired: boolean;
  } | null;
  summary: ResultSummary;
  lockedMessage?: string;
  upgradePlans?: UpgradePlan[];
  detail?: ResultDetail;
}
