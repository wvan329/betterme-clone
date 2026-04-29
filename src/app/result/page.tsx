'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { apiUrl, assetUrl } from '@/lib/api-url';
import type { ResultResponse } from '@/types';

const LABELS: Record<string, string> = {
  UNDERWEIGHT: '偏瘦', NORMAL: '正常', OVERWEIGHT: '超重', OBESE: '肥胖',
  ECTOMORPH: '外胚层型', MESOMORPH: '中胚层型', ENDOMORPH: '内胚层型',
  BEGINNER: '初学者', INTERMEDIATE: '中级', ADVANCED: '高级',
  FAST: '较快', MODERATE: '中等', SLOW: '较慢',
};

export default function ResultPage() {
  const router = useRouter();
  const { userId } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultResponse | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        await fetch(apiUrl('/api/assessment/complete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }).catch(() => {});
        const res = await fetch(apiUrl(`/api/result?userId=${userId}`));
        if (!res.ok) throw new Error('获取结果失败');
        setResult(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handlePay = async (planType: string) => {
    if (!userId) return;
    try {
      const res = await fetch(apiUrl('/api/pay'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planType }),
      });
      if (res.ok) { window.location.reload(); }
      else { const e = await res.json().catch(() => ({})); alert(e.error || '支付失败'); }
    } catch { alert('网络错误'); }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">生成您的专属计划...</p>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 gap-4">
        <p className="text-red-500">{error || '数据加载失败'}</p>
        <button onClick={() => router.push('/')} className="text-emerald-600 underline">返回首页</button>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen px-5 py-8 max-w-lg mx-auto w-full pb-20 animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-6">
        <img src={assetUrl('/logo.png')} alt="BetterMe" className="w-10 h-10 rounded-xl mx-auto mb-2" />
        <h1 className="text-lg font-bold text-gray-900">
          {result.userName ? `${result.userName}，` : ''}您的普拉提新手计划已就绪
        </h1>
      </div>

      {/* 摘要卡片 */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">📋 健康概览</h3>
        <div className="space-y-3">
          <Row label="BMI" value={`${result.summary.bmi} · ${LABELS[result.summary.bmiCategory] || result.summary.bmiCategory}`} />
          <Row label="体态类型" value={LABELS[result.summary.bodyType] || result.summary.bodyType} />
          <Row label="健身水平" value={LABELS[result.summary.fitnessLevel] || result.summary.fitnessLevel} />
          {result.type === 'FULL' && result.summary.metabolism && (
            <Row label="代谢水平" value={LABELS[result.summary.metabolism] || result.summary.metabolism} />
          )}
        </div>
      </div>

      {/* 会员完整数据 */}
      {result.type === 'FULL' && result.detail && (
        <div className="card mb-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-4">📊 完整计划</h3>
          <div className="space-y-3 mb-5">
            <Row label="每日建议摄入" value={`${result.detail.suggestedCalories} kcal`} />
            <Row label="预测目标日期" value={new Date(result.detail.targetDate).toLocaleDateString('zh-CN')} />
            <Row label="4周后预测体重" value={`${result.detail.predictedWeight} kg`} />
          </div>

          {result.detail.weightChart && result.detail.weightChart.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-3 font-medium">📉 体重变化预测</p>
              <div className="flex items-end gap-2 h-28">
                {result.detail.weightChart.map((point) => {
                  const maxW = result.detail!.weightChart![0].weight;
                  const minW = result.detail!.weightChart![result.detail!.weightChart!.length - 1].weight;
                  const range = maxW - minW || 1;
                  const hPct = ((point.weight - minW) / range) * 70 + 15;
                  return (
                    <div key={point.week} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-xs font-semibold text-gray-700 mb-1">{point.weight}</span>
                      <div className="w-full bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-md transition-all" style={{ height: `${hPct}%` }} />
                      <span className="text-[10px] text-gray-400 mt-1.5">W{point.week}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 非会员：付费 */}
      {result.type === 'RESTRICTED' && (
        <div className="mb-6">
          <div className="card border-amber-200 bg-amber-50 text-center mb-5">
            <p className="text-amber-800 font-medium text-sm">🔒 {result.lockedMessage}</p>
          </div>

          <h3 className="font-semibold text-gray-800 mb-3 text-sm">选择您的计划</h3>
          <div className="space-y-2.5">
            {result.upgradePlans?.map((plan) => (
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
                    <p className="text-xs text-gray-400">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs line-through text-gray-300">${plan.originalPrice}</p>
                    <p className="text-lg font-bold text-emerald-600">${plan.price}</p>
                    <p className="text-[10px] text-emerald-500 font-medium">{plan.discount}% OFF</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[10px] text-gray-300 text-center mt-3">点击计划即模拟支付，立即解锁完整数据</p>

          <button onClick={() => router.push('/email')} className="w-full mt-4 text-sm text-gray-400 underline">
            先跳过，输入邮箱
          </button>
        </div>
      )}

      {/* 会员继续按钮 */}
      {result.type === 'FULL' && (
        <button onClick={() => router.push('/email')} className="btn-primary w-full">
          继续 →
        </button>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}
