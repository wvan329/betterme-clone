'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import type { ResultResponse } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { userId } = useSession();
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/result?userId=${userId}`);
        if (res.ok) setResult(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [userId]);

  const handlePay = async (planType: string) => {
    if (!userId) return;
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planType }),
      });
      if (res.ok) {
        alert('🎉 支付成功！');
        router.push('/result');
      } else {
        const e = await res.json().catch(() => ({}));
        alert(e.error || '支付失败');
      }
    } catch { alert('网络错误'); }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const isActive = result?.subscription?.status === 'ACTIVE' && !result?.subscription?.isExpired;

  return (
    <main className="flex-1 min-h-screen px-5 py-8 max-w-lg mx-auto w-full animate-fade-in">
      <div className="text-center mb-8">
        <img src="/logo.png" alt="BetterMe" className="w-10 h-10 rounded-xl mx-auto mb-3" />
        <h1 className="text-xl font-bold text-gray-900">BetterMe</h1>
      </div>

      {isActive ? (
        <div className="text-center space-y-4">
          <div className="card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-bold text-emerald-700">您已是会员</p>
            <p className="text-sm text-emerald-600 mt-1">
              {result?.subscription?.planType === 'FOUR_WEEK' ? '4周计划' :
               result?.subscription?.planType === 'ONE_WEEK_TRIAL' ? '1周试用' :
               result?.subscription?.planType === 'TWELVE_WEEK' ? '12周计划' : '未知计划'}
            </p>
            {result?.subscription?.endDate && (
              <p className="text-xs text-gray-400 mt-1">
                有效期至 {new Date(result.subscription.endDate).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
          <button onClick={() => router.push('/result')} className="btn-primary w-full">
            查看完整计划
          </button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">选择您的计划</h2>
            <p className="text-sm text-gray-400 mt-1">解锁个性化普拉提方案</p>
          </div>

          <div className="space-y-2.5 mb-6">
            {[
              { id: 'ONE_WEEK_TRIAL', name: '1周试用', sub: '4周计划 · 首周体验价', price: '$6.93', orig: '$17.77' },
              { id: 'FOUR_WEEK', name: '4周计划', sub: '首月优惠价', price: '$15.19', orig: '$38.95', tag: '最受欢迎' },
              { id: 'TWELVE_WEEK', name: '12周计划', sub: '季度优惠价', price: '$36.99', orig: '$94.85' },
            ].map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePay(plan.id)}
                className="card w-full text-left relative hover:border-emerald-300 transition-colors cursor-pointer"
              >
                {plan.tag && (
                  <span className="absolute -top-2 right-4 bg-amber-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {plan.tag}
                  </span>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{plan.name}</p>
                    <p className="text-xs text-gray-400">{plan.sub}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs line-through text-gray-300">{plan.orig}</p>
                    <p className="text-lg font-bold text-emerald-600">{plan.price}</p>
                    <p className="text-[10px] text-emerald-500 font-medium">61% OFF</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-gray-300 text-center mb-4">
            点击即模拟支付，立即解锁完整数据
          </p>

          <button onClick={() => router.push('/result')} className="w-full text-sm text-gray-400 underline py-2">
            返回结果页
          </button>
        </div>
      )}
    </main>
  );
}
