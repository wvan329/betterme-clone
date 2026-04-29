'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';

export default function EmailPage() {
  const router = useRouter();
  const { userId } = useSession();
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!userId || !email.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: email.trim() }),
      });
      if (res.ok) { router.push('/name'); }
      else { const e = await res.json().catch(() => ({})); alert(e.error || '保存失败'); }
    } catch { alert('网络错误'); }
    finally { setSaving(false); }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-5 max-w-lg mx-auto w-full animate-fade-in">
      <img src="/logo.png" alt="BetterMe" className="w-12 h-12 rounded-xl mb-6" />

      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">获取您的专属计划</h2>
        <p className="text-sm text-gray-400">输入邮箱，我们将发送完整方案</p>
      </div>

      <div className="w-full space-y-4">
        <div className="relative">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field text-center"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>

        <button onClick={handleSubmit} disabled={!email.trim() || saving} className="btn-primary w-full">
          {saving ? '保存中...' : '继续 →'}
        </button>

        <button onClick={() => router.push('/name')} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
          跳过
        </button>
      </div>

      <p className="text-xs text-gray-300 mt-10 text-center leading-relaxed">
        我们尊重您的隐私，数据将按
        <a href="#" className="underline mx-1">隐私政策</a>
        处理
      </p>
    </main>
  );
}
