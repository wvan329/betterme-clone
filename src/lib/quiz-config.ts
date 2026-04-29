// ─── 问卷步骤配置 ───

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizStep {
  step: number;        // 问卷显示步骤号（1-14）
  apiStep: number;     // API 中的步骤号（2-15，因为 step 1 是年龄选择）
  section: string;
  question: string;
  subtitle?: string;
  type: 'single' | 'multi' | 'height-weight' | 'goal-weight-age';
  options?: QuizOption[];
  nextRoute: string | null;
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    step: 1, apiStep: 2, section: '基本信息', question: '您的性别是？', type: 'single',
    options: [
      { value: 'MALE', label: '男性' },
      { value: 'FEMALE', label: '女性' },
      { value: 'OTHER', label: '其他' },
    ],
    nextRoute: '/quiz/2',
  },
  {
    step: 2, apiStep: 3, section: '生活习惯', question: '您的典型一天是怎样的？', type: 'single',
    options: [
      { value: 'SITTING', label: '大部分时间坐着' },
      { value: 'ACTIVE_BREAKS', label: '会主动活动休息' },
      { value: 'ON_FEET', label: '整天都在站着/走动' },
    ],
    nextRoute: '/quiz/3',
  },
  {
    step: 3, apiStep: 4, section: '生活习惯', question: '您白天的精力水平如何？', type: 'single',
    options: [
      { value: 'HIGH_STEADY', label: '精力充沛且稳定' },
      { value: 'DRAGGING', label: '饭前容易疲惫' },
      { value: 'POST_LUNCH_SLUMP', label: '午后犯困' },
      { value: 'LOW_TIRED', label: '整天都感到疲倦' },
    ],
    nextRoute: '/quiz/4',
  },
  {
    step: 4, apiStep: 5, section: '生活习惯', question: '您每天喝多少水？', type: 'single',
    options: [
      { value: 'COFFEE_TEA_ONLY', label: '只喝咖啡或茶' },
      { value: 'TWO_GLASSES', label: '约2杯（约500ml）' },
      { value: 'TWO_TO_SIX', label: '2~6杯（约500ml-1.5L）' },
      { value: 'MORE_THAN_SIX', label: '6杯以上（超过1.5L）' },
    ],
    nextRoute: '/quiz/5',
  },
  {
    step: 5, apiStep: 6, section: '生活习惯', question: '您通常睡多少小时？', type: 'single',
    options: [
      { value: 'LESS_THAN_5', label: '少于5小时' },
      { value: 'FIVE_TO_SIX', label: '5-6小时' },
      { value: 'SEVEN_TO_EIGHT', label: '7-8小时' },
      { value: 'MORE_THAN_8', label: '超过8小时' },
    ],
    nextRoute: '/quiz/6',
  },
  {
    step: 6, apiStep: 7, section: '饮食习惯', question: '您通常几点吃早餐？', type: 'single',
    options: [
      { value: 'SIX_TO_EIGHT', label: '早上6-8点' },
      { value: 'EIGHT_TO_TEN', label: '早上8-10点' },
      { value: 'TEN_TO_NOON', label: '上午10点-中午' },
      { value: 'SKIP', label: '通常不吃早餐' },
    ],
    nextRoute: '/quiz/7',
  },
  {
    step: 7, apiStep: 8, section: '饮食习惯', question: '午餐呢？', type: 'single',
    options: [
      { value: 'TEN_TO_NOON', label: '上午10点-中午' },
      { value: 'NOON_TO_TWO', label: '中午12点-下午2点' },
      { value: 'TWO_TO_FOUR', label: '下午2-4点' },
      { value: 'SKIP', label: '通常不吃午餐' },
    ],
    nextRoute: '/quiz/8',
  },
  {
    step: 8, apiStep: 9, section: '饮食习惯', question: '您几点吃晚餐？', type: 'single',
    options: [
      { value: 'FOUR_TO_SIX', label: '下午4-6点' },
      { value: 'SIX_TO_EIGHT', label: '晚上6-8点' },
      { value: 'EIGHT_TO_TEN', label: '晚上8-10点' },
      { value: 'SKIP', label: '通常不吃晚餐' },
    ],
    nextRoute: '/quiz/9',
  },
  {
    step: 9, apiStep: 10, section: '饮食习惯', question: '您偏好哪种饮食方式？', type: 'single',
    options: [
      { value: 'TRADITIONAL', label: '传统饮食（什么都吃）' },
      { value: 'KETO', label: '生酮（高脂肪低碳水）' },
      { value: 'PALEO', label: '原始饮食（不吃加工食品）' },
      { value: 'VEGETARIAN', label: '素食（不吃肉和鱼）' },
      { value: 'VEGAN', label: '纯素（不吃任何动物产品）' },
      { value: 'KETO_VEGAN', label: '纯素生酮' },
      { value: 'MEDITERRANEAN', label: '地中海饮食' },
      { value: 'PESCATARIAN', label: '鱼素（不吃肉但吃鱼）' },
      { value: 'LACTOSE_FREE', label: '无乳糖' },
      { value: 'GLUTEN_FREE', label: '无麸质' },
    ],
    nextRoute: '/quiz/10',
  },
  {
    step: 10, apiStep: 11, section: '饮食习惯', question: '您有以下哪些习惯？（可多选）', subtitle: '选择所有符合的选项', type: 'multi',
    options: [
      { value: 'LATE_EATING', label: '深夜进食' },
      { value: 'SUGAR', label: '戒不掉甜食' },
      { value: 'SODA', label: '离不开汽水' },
      { value: 'TOO_MUCH_SALT', label: '吃太咸' },
      { value: 'NONE', label: '以上都没有' },
    ],
    nextRoute: '/quiz/11',
  },
  {
    step: 11, apiStep: 12, section: '生活事件', question: '过去几年哪些事件导致了体重增加？（可多选）', subtitle: '选择所有符合的选项', type: 'multi',
    options: [
      { value: 'MARRIAGE', label: '结婚或恋爱' },
      { value: 'BUSY_WORK', label: '工作或家庭忙碌' },
      { value: 'FINANCIAL', label: '经济压力' },
      { value: 'STRESS', label: '高压力或焦虑' },
      { value: 'AGING', label: '年龄增长代谢变慢' },
      { value: 'NONE', label: '以上都没有' },
    ],
    nextRoute: '/quiz/12',
  },
  {
    step: 12, apiStep: 13, section: '即将到来', question: '您近期有重要的活动吗？', type: 'single',
    options: [
      { value: 'VACATION', label: '度假' },
      { value: 'WEDDING', label: '婚礼' },
      { value: 'HOLIDAY', label: '节日' },
      { value: 'SPORTING', label: '体育赛事' },
      { value: 'REUNION', label: '同学聚会' },
      { value: 'BIRTHDAY', label: '生日' },
      { value: 'OTHER', label: '其他' },
      { value: 'NONE', label: '近期没有' },
    ],
    nextRoute: '/quiz/13',
  },
  {
    step: 13, apiStep: 14, section: '身体数据', question: '您的身高和体重是多少？', type: 'height-weight',
    nextRoute: '/quiz/14',
  },
  {
    step: 14, apiStep: 15, section: '身体数据', question: '您的目标体重和年龄是多少？', type: 'goal-weight-age',
    nextRoute: null,
  },
];

export function getStepConfig(displayStep: number): QuizStep | undefined {
  return QUIZ_STEPS.find(s => s.step === displayStep);
}

export const TOTAL_STEPS = 14;
