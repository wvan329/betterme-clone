'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { apiUrl } from '@/lib/api-url';

export default function NamePage() {
  const router = useRouter();
  const { userId } = useSession();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!userId || !name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/user/name'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: name.trim() }),
      });
      if (res.ok) { router.push('/checkout'); }
      else { const e = await res.json().catch(() => ({})); alert(e.error || '保存失败'); }
    } catch { alert('网络错误'); }
    finally { setSaving(false); }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-5 max-w-lg mx-auto w-full animate-fade-in">
      <img src="/logo.png" alt="BetterMe" className="w-12 h-12 rounded-xl mb-6" />

      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">您叫什么名字？</h2>
        <p className="text-sm text-gray-400">让我们个性化您的体验</p>
      </div>

      <div className="w-full space-y-4">
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="您的名字"
          className="input-field text-center"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />

        <button onClick={handleSubmit} disabled={!name.trim() || saving} className="btn-primary w-full">
          {saving ? '保存中...' : '继续 →'}
        </button>
      </div>
    </main>
  );
}
