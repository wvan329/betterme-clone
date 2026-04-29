# BetterMe Pilates 中文版

> 普拉提新手计划测评系统 —— 全栈健康评估平台

基于 Next.js 16 + Prisma 7 + PostgreSQL 构建的健康测评 SaaS 应用。用户完成 14 道问卷后，服务端计算 BMI、体态类型、代谢水平，并生成个性化 4 周普拉提计划。支持分步保存、进度恢复、模拟支付鉴权。

**🟢 在线体验：[https://a.wgk-fun.top/betterme-api](https://a.wgk-fun.top/betterme-api)**

---

## 🚀 快速开始

### 环境要求
- Node.js 20+
- pnpm 10+
- PostgreSQL 16（或使用 `prisma dev` 内置数据库）

### 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 复制环境变量
cp .env.example .env

# 3. 启动本地数据库（Prisma 内置）
npx prisma dev

# 4. 新开终端，同步数据库 schema
npx prisma db push

# 5. 生成 Prisma Client
npx prisma generate

# 6. 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

---

## 🐳 Docker 部署（Linux 服务器）

### 前置条件
- 安装 Docker 和 Docker Compose
- 开放 3000 端口

### 部署步骤

```bash
# 1. 克隆代码
git clone https://github.com/your-username/betterme-clone.git
cd betterme-clone

# 2. 设置数据库密码
export DB_PASSWORD=your_secure_password

# 3. 构建并启动
docker compose up -d --build

# 4. 运行数据库迁移
docker compose exec app npx prisma db push

# 5. 查看日志确认启动
docker compose logs -f
```

访问 `http://your-server-ip:3000`

### 常用命令

```bash
# 重启服务
docker compose restart

# 查看状态
docker compose ps

# 停止服务
docker compose down

# 更新代码后重新部署
git pull
docker compose up -d --build
docker compose exec app npx prisma db push
```

---

## 📡 API 文档

### 基础 URL
- 开发环境: `http://localhost:3000/api`
- 生产环境: `https://your-domain.com/api`

### 通用说明
- Content-Type: `application/json`
- 用户识别: 通过 `userId`（UUID v4）关联所有数据
- 错误响应: `{ "error": "错误描述" }`

---

### 测评模块

#### `POST /api/assessment/start`

创建测评会话，或恢复已有进度。

**Request:**
```json
{ "sessionId": "550e8400-e29b-41d4-a716-446655440000" }
```

**Response (201 - 新用户):**
```json
{ "userId": "uuid", "currentStep": 1, "status": "IN_PROGRESS", "isNew": true }
```

**Response (200 - 已有进度):**
```json
{ "userId": "uuid", "currentStep": 5, "status": "IN_PROGRESS", "isNew": false }
```

---

#### `POST /api/assessment/save-step`

分步保存测评数据（共 15 个 API step）。客户端每完成一题自动调用。

**Request:**
```json
{
  "userId": "uuid",
  "step": 2,
  "data": { "gender": "MALE" }
}
```

**Response (200):**
```json
{ "success": true, "currentStep": 2 }
```

**错误码:**

| 状态码 | 说明 |
|--------|------|
| 400 | Zod 校验失败（如身高超出范围） |
| 404 | 未找到进行中的测评 |
| 409 | 跳步（step 超过 currentStep + 1） |

**Step → 字段映射:**

| API Step | 问卷题号 | 字段 | 类型 |
|----------|---------|------|------|
| 1 | 入口 | ageRange | `"18-29" \| "30-39" \| "40-49" \| "50+"` |
| 2 | Q1 | gender | `"MALE" \| "FEMALE" \| "OTHER"` |
| 3 | Q2 | dailyActivity | `"SITTING" \| "ACTIVE_BREAKS" \| "ON_FEET"` |
| 4 | Q3 | energyLevel | `"HIGH_STEADY" \| "DRAGGING" \| "POST_LUNCH_SLUMP" \| "LOW_TIRED"` |
| 5 | Q4 | waterIntake | `"COFFEE_TEA_ONLY" \| "TWO_GLASSES" \| "TWO_TO_SIX" \| "MORE_THAN_SIX"` |
| 6 | Q5 | sleepHours | `"LESS_THAN_5" \| "FIVE_TO_SIX" \| "SEVEN_TO_EIGHT" \| "MORE_THAN_8"` |
| 7 | Q6 | breakfastTime | `"SIX_TO_EIGHT" \| "EIGHT_TO_TEN" \| "TEN_TO_NOON" \| "SKIP"` |
| 8 | Q7 | lunchTime | `"TEN_TO_NOON" \| "NOON_TO_TWO" \| "TWO_TO_FOUR" \| "SKIP"` |
| 9 | Q8 | dinnerTime | `"FOUR_TO_SIX" \| "SIX_TO_EIGHT" \| "EIGHT_TO_TEN" \| "SKIP"` |
| 10 | Q9 | dietType | `"TRADITIONAL" \| "KETO" \| ...` （10种） |
| 11 | Q10 | badHabits | `string[]`（多选） |
| 12 | Q11 | lifeEvents | `string[]`（多选） |
| 13 | Q12 | upcomingEvent | `"VACATION" \| "WEDDING" \| ... \| "NONE"` |
| 14 | Q13 | height + weight | `number` (cm, kg) |
| 15 | Q14 | goalWeight + targetAge | `number` (kg, 岁) |

---

#### `GET /api/assessment/progress?userId={uuid}`

获取测评进度，前端用于恢复中断的问卷。

**Response (200):**
```json
{
  "userId": "uuid",
  "currentStep": 5,
  "status": "IN_PROGRESS",
  "filledData": {
    "ageRange": "18-29",
    "gender": "MALE",
    "dailyActivity": "SITTING",
    "energyLevel": "HIGH_STEADY"
  }
}
```

---

#### `POST /api/assessment/complete`

触发服务端健康评估计算，生成 BMI、体态类型、预测数据。

**Request:**
```json
{ "userId": "uuid" }
```

**Response (201):**
```json
{ "success": true, "healthProfileId": "uuid" }
```

**计算内容：**
- BMI = 体重(kg) / (身高(m))²
- BMR（Mifflin-St Jeor 公式）
- TDEE = BMR × 活动系数
- 建议摄入 = TDEE - 500（不低于 1200 kcal）
- 目标日期 = 当前体重 - 目标体重 / 0.75 kg/周
- 4 周体重预测曲线

---

### 结果模块

#### `GET /api/result?userId={uuid}` ⭐鉴权

根据订阅状态返回差异化数据。

**非会员响应:**
```json
{
  "type": "RESTRICTED",
  "summary": { "bmi": 23.5, "bmiCategory": "NORMAL", "bodyType": "MESOMORPH", "fitnessLevel": "BEGINNER" },
  "lockedMessage": "解锁完整计划...",
  "upgradePlans": [
    { "id": "FOUR_WEEK", "name": "4周计划", "price": 15.19, "originalPrice": 38.95, "discount": 61, "tag": "最受欢迎" }
  ]
}
```

**会员响应:**
```json
{
  "type": "FULL",
  "summary": { "...": "...", "metabolism": "MODERATE" },
  "detail": {
    "suggestedCalories": 1447,
    "targetDate": "2026-06-24T10:31:12.191Z",
    "predictedWeight": 65,
    "weightChart": [
      { "week": 0, "weight": 68 },
      { "week": 1, "weight": 67.3 },
      { "week": 2, "weight": 66.5 },
      { "week": 3, "weight": 65.8 },
      { "week": 4, "weight": 65 }
    ]
  }
}
```

---

### 支付模块

#### `POST /api/pay`

模拟支付，激活订阅。

**Request:**
```json
{ "userId": "uuid", "planType": "FOUR_WEEK" }
```

**planType 枚举:** `ONE_WEEK_TRIAL` (7天) | `FOUR_WEEK` (28天) | `TWELVE_WEEK` (84天)

**Response (200):**
```json
{
  "success": true,
  "subscription": {
    "status": "ACTIVE",
    "planType": "FOUR_WEEK",
    "startDate": "2026-04-29T...",
    "endDate": "2026-05-27T..."
  }
}
```

---

#### `GET /api/subscription?userId={uuid}`

查询当前订阅状态。

---

### 用户模块

#### `POST /api/user/email`
```json
// Request
{ "userId": "uuid", "email": "test@example.com" }
// Response
{ "success": true, "email": "test@example.com" }
```

#### `POST /api/user/name`
```json
// Request
{ "userId": "uuid", "name": "张三" }
// Response
{ "success": true, "name": "张三" }
```

---

## 🗄️ 数据库 Schema

| 表名 | 字段 | 类型 | 说明 |
|------|------|------|------|
| **User** | id | uuid PK | 用户唯一标识 |
| | sessionId | string UK | 匿名会话 ID（localStorage UUID） |
| | email | string? | 邮箱（可选） |
| | name | string? | 姓名（可选） |
| | createdAt | datetime | |
| | updatedAt | datetime | |
| **Assessment** | id | uuid PK | 测评记录 ID |
| | userId | uuid FK → User | 关联用户 |
| | currentStep | int | 当前步骤 (1-15) |
| | status | string | IN_PROGRESS / COMPLETED |
| | ageRange | string? | 年龄段 |
| | gender | string? | 性别 |
| | dailyActivity | string? | 日常活动水平 |
| | energyLevel | string? | 精力水平 |
| | waterIntake | string? | 饮水习惯 |
| | sleepHours | string? | 睡眠时长 |
| | breakfastTime | string? | 早餐时间 |
| | lunchTime | string? | 午餐时间 |
| | dinnerTime | string? | 晚餐时间 |
| | dietType | string? | 饮食方式（10种） |
| | badHabits | json? | 坏习惯（多选数组） |
| | lifeEvents | json? | 生活事件（多选数组） |
| | upcomingEvent | string? | 近期活动 |
| | height | float? | 身高 (cm) |
| | weight | float? | 体重 (kg) |
| | goalWeight | float? | 目标体重 (kg) |
| | targetAge | int? | 年龄 |
| | createdAt | datetime | |
| | updatedAt | datetime | |
| **HealthProfile** | id | uuid PK | 健康档案 ID |
| | userId | uuid FK UK | 关联用户（唯一） |
| | bmi | float | BMI 值 |
| | bmiCategory | string | 偏瘦/正常/超重/肥胖 |
| | bodyType | string | 外胚层/中胚层/内胚层 |
| | fitnessLevel | string | 初学者/中级/高级 |
| | metabolism | string | 代谢快/中/慢 |
| | suggestedCalories | int | 建议每日摄入 (kcal) |
| | targetDate | datetime | 预测目标日期 |
| | predictedWeight | float | 4周后预测体重 |
| | rawData | json? | 完整计算结果（含 weightChart） |
| | createdAt | datetime | |
| **Subscription** | id | uuid PK | 订阅记录 ID |
| | userId | uuid FK UK | 关联用户（唯一） |
| | status | string | INACTIVE / ACTIVE / EXPIRED |
| | planType | string? | 1周试用 / 4周 / 12周 |
| | startDate | datetime? | 订阅开始时间 |
| | endDate | datetime? | 订阅到期时间 |
| | createdAt | datetime | |
| | updatedAt | datetime | |

### 表关系

```
User ──1:N── Assessment   （一个用户可多次测评）
User ──1:1── HealthProfile （一个用户一个健康档案）
User ──1:1── Subscription  （一个用户一个订阅记录）
```

> 打开 [schema.html](schema.html) 查看可视化 ER 图。

### 设计要点

| 决策 | 说明 |
|------|------|
| `sessionId` 唯一索引 | 前端 localStorage UUID 标识匿名用户，无需注册登录 |
| 测评字段全部可选（`?`） | 支持分步保存，未填字段为 NULL |
| `badHabits` / `lifeEvents` 用 JSON | 多选数量不固定，JSON 数组灵活扩展 |
| 身高体重统一 cm/kg | 前端自由切换单位，后端统一存储计算 |
| `rawData` 存完整结果 | 会员直接返回此字段；非会员仅返回计算摘要 |
| 订阅自动过期检测 | API 层实时判断 `endDate`，过期自动标记 EXPIRED |

---

## 🧠 AI 使用复盘

### 1. 数据库建模

**协作方式：** 我先设计初始 Schema 草稿，交给 AI 审查。AI 指出：
- `Assessment` 表字段过多（20+字段），建议按「生活方式」「营养」「身体数据」分组注释，提升可读性
- `Subscription` 应增加 `endDate` 自动过期逻辑而非依赖定时任务
- JSON 字段用于 `badHabits` 和 `lifeEvents` 比关联表更合适（多选不超过 6 项）

**AI 价值：** 快速发现设计缺陷（如忘记 `updatedAt`、索引遗漏），生成 Prisma schema 代码比手写快 3 倍。

### 2. 生成 Mock 数据

**协作方式：** 让 AI 生成 100 条符合真实分布的测评数据：
```text
请生成 100 条 JSON，每条包含：
- height: 正态分布 μ=168 σ=8
- weight: 与身高成比例，BMI 集中在 18-28
- gender: 60% FEMALE, 40% MALE
- ageRange: 均匀分布四个区间
```

AI 生成的数据直接用于 API 压力测试和前端 UI 调试，无需手动编造。

### 3. 编写复杂逻辑

**健康算法：** AI 提供 Mifflin-St Jeor 公式的 TypeScript 实现，我校验医学准确性（参考 CDC 每周减重 0.5-1kg 指南），微调了：
- 每日摄入下限设为 1200 kcal（AI 初版设为 1000，过低）
- 目标日期计算加入 `Math.ceil` 确保整数周数

**鉴权差异化返回：** AI 建议将完整结果存为 `rawData` JSON 字段，鉴权层根据 `subscription.status` 决定返回 `rawData` 还是仅返回摘要字段。这个设计使鉴权逻辑集中在 `/api/result` 一个路由，不污染其他模块。

**Zod 校验链：** 每步独立 schema + 统一 `validateStepData` 函数，AI 帮我写了 15 个 schema 的样板代码，我只需填充枚举值。

### 4. 总结

| 场景 | 纯手写 | AI 辅助 |
|------|--------|---------|
| Prisma Schema | 40 min | 10 min（审查+微调） |
| Mock 数据生成 | 30 min | 2 min（生成+验证） |
| 15 个 Zod Schema | 25 min | 5 min（复制枚举值） |
| 健康算法 | 60 min | 15 min（公式+边界审查） |
| Docker 配置 | 20 min | 3 min（直接生成可用） |

AI 不是代码生成器，而是 **设计审查者 + 样板代码加速器 + 边界情况提醒者**。核心业务逻辑（鉴权流转、状态机）仍需人工把控。

---

## 📁 项目结构

```
betterme-clone/
├── prisma/
│   ├── schema.prisma          # 数据库模型
│   └── migrations/            # 迁移文件
├── public/
│   ├── audio/                 # TTS 语音（q1-q14.mp3）
│   ├── quiz/                  # 问卷配图（step1-step14.jpg）
│   ├── age-*.jpg              # 年龄选择图片
│   ├── logo.png               # Logo
│   └── *.jpg                  # 装饰图
├── src/
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── assessment/
│   │   │   │   ├── start/route.ts
│   │   │   │   ├── save-step/route.ts
│   │   │   │   ├── progress/route.ts
│   │   │   │   └── complete/route.ts
│   │   │   ├── result/route.ts
│   │   │   ├── subscription/route.ts
│   │   │   ├── pay/route.ts
│   │   │   └── user/
│   │   │       ├── email/route.ts
│   │   │       └── name/route.ts
│   │   ├── quiz/[step]/page.tsx
│   │   ├── result/page.tsx
│   │   ├── email/page.tsx
│   │   ├── name/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx           # 年龄选择首页
│   ├── hooks/
│   │   └── use-session.ts     # 会话管理 Hook
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client 单例
│   │   ├── schemas.ts         # Zod 校验
│   │   ├── health-calculator.ts # 健康评估算法
│   │   ├── quiz-config.ts     # 问卷配置
│   │   └── subscription-guard.ts # 鉴权中间件
│   └── types/
│       └── index.ts           # 共享类型
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── prisma.config.ts
├── package.json
└── README.md
```

---

## 📄 License

MIT
