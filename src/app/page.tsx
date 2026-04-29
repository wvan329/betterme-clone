'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from '@/hooks/use-session';
import { apiUrl } from '@/lib/api-url';

const AGE_OPTIONS = [
  { value: '18-29', label: '18-29岁', img: '/age-18-29.jpg' },
  { value: '30-39', label: '30-39岁', img: '/age-30-39.jpg' },
  { value: '40-49', label: '40-49岁', img: '/age-40-49.jpg' },
  { value: '50+', label: '50岁以上', img: '/age-50-plus.jpg' },
];

export default function HomePage() {
  const router = useRouter();
  const { userId, loading, error } = useSession();
  const [saving, setSaving] = useState(false);

  const handleSelect = async (ageRange: string) => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/assessment/save-step'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, step: 1, data: { ageRange } }),
      });
      if (res.ok) {
        router.push('/quiz/1');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || '保存失败，请重试');
        setSaving(false);
      }
    } catch {
      alert('网络错误，请重试');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 gap-4">
        <p className="text-red-500">出错了：{error}</p>
        <button onClick={() => window.location.reload()} className="text-emerald-600 underline">刷新页面</button>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center min-h-screen px-5 py-10 max-w-lg mx-auto w-full animate-fade-in">
      {/* Logo */}
      <div className="mb-3">
        <img src="/logo.png" alt="BetterMe" className="w-12 h-12 rounded-xl shadow-sm" />
      </div>

      {/* 标题区 */}
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3">
          普拉提新手
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">选择您的年龄段</h1>
        <p className="text-sm text-gray-400">1 分钟快速测评 · 获取专属计划</p>
      </div>

      {/* 年龄卡片 */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {AGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            disabled={saving}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={opt.img}
                alt={opt.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 text-center bg-white">
              <span className="font-semibold text-sm text-gray-800">{opt.label}</span>
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5 pointer-events-none" />
          </button>
        ))}
      </div>

      {/* 查看结果 */}
      <button
        onClick={() => router.push('/result')}
        className="mt-8 text-sm text-gray-400 hover:text-emerald-600 transition-colors underline underline-offset-4"
      >
        查看我的测评结果
      </button>

      {/* 底部 */}
      <p className="text-xs text-gray-300 mt-auto pt-10 text-center leading-relaxed">
        选择年龄并继续即表示您同意我们的
        <a href="#" className="underline mx-1 hover:text-gray-500">服务条款</a>
        和
        <a href="#" className="underline mx-1 hover:text-gray-500">隐私政策</a>
      </p>
    </main>
  );
}
