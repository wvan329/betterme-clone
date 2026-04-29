// 客户端路径工具
// 当 Next.js basePath 存在时，自动为所有请求添加前缀

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function apiUrl(path: string): string {
  return `${BASE}${path}`;
}

export function assetUrl(path: string): string {
  return `${BASE}${path}`;
}
