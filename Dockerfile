# ─── 构建阶段 ───
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 依赖缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 源码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建 Next.js
RUN pnpm build

# ─── 运行阶段 ───
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production

# 复制构建产物
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
