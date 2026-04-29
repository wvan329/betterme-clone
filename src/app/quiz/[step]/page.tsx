'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/use-session';
import { getStepConfig, TOTAL_STEPS } from '@/lib/quiz-config';
import { apiUrl } from '@/lib/api-url';

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-400">第 {current} 题 / 共 {total} 题</span>
        <span className="text-xs font-semibold text-emerald-500">{pct}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SingleSelect({
  options, selected, onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`option-btn w-full text-left flex items-center gap-3 ${selected === opt.value ? 'selected' : ''}`}
        >
          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            selected === opt.value ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
          }`}>
            {selected === opt.value && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          <span className="text-sm">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function MultiSelect({
  options, selected, onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            className={`option-btn w-full text-left flex items-center gap-3 ${isSelected ? 'selected' : ''}`}
          >
            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span className="text-sm">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function QuizStepPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const displayStep = Number(params.step);
  const config = getStepConfig(displayStep);
  const apiStep = config?.apiStep || displayStep + 1;

  const [singleValue, setSingleValue] = useState<string | null>(null);
  const [multiValues, setMultiValues] = useState<string[]>([]);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [age, setAge] = useState('');
  const [saving, setSaving] = useState(false);

  // 🔈 TTS 语音播报
  useEffect(() => {
    const audioFile = `/audio/q${displayStep}.mp3`;
    const audio = new Audio(audioFile);
    audioRef.current = audio;
    audio.play().catch(() => {}); // 静默失败（浏览器可能阻止自动播放）
    return () => { audio.pause(); };
  }, [displayStep]);

  const handleSave = async (data: Record<string, unknown>) => {
    if (!userId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/assessment/save-step'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, step: apiStep, data }),
      });
      if (res.ok) {
        config?.nextRoute ? router.push(config.nextRoute) : router.push('/result');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || '保存失败');
      }
    } catch { alert('网络错误'); }
    finally { setSaving(false); }
  };

  const handleMultiToggle = (value: string) => {
    setMultiValues(prev => {
      if (value === 'NONE') return ['NONE'];
      const filtered = prev.filter(v => v !== 'NONE');
      return filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value];
    });
  };

  if (!config) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <p className="text-red-500">未知步骤：{displayStep}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen px-5 py-8 max-w-lg mx-auto w-full animate-fade-in">
      {/* Logo */}
      <div className="mb-5">
        <img src="/logo.png" alt="BetterMe" className="w-8 h-8 rounded-lg" />
      </div>

      {/* 进度条 */}
      <ProgressBar current={displayStep} total={TOTAL_STEPS} />

      {/* 配图 */}
      <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
        <img
          src={`/quiz/step${displayStep}.jpg`}
          alt={config.question}
          className="w-full aspect-[3/2] object-cover"
        />
      </div>

      {/* 标题 */}
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-3">
          {config.section}
        </span>
        <h2 className="text-xl font-bold text-gray-900 leading-snug">{config.question}</h2>
        {config.subtitle && <p className="text-sm text-gray-400 mt-1">{config.subtitle}</p>}
      </div>

      {/* 内容区 */}
      <div className="flex-1">
        {config.type === 'single' && config.options && (
          <>
            <SingleSelect options={config.options} selected={singleValue} onSelect={setSingleValue} />
            <div className="mt-8">
              <button
                onClick={() => { if (!singleValue) return; handleSave({ [getFieldName(apiStep)]: singleValue }); }}
                disabled={!singleValue || saving}
                className="btn-primary w-full"
              >
                {saving ? '保存中...' : '下一步 →'}
              </button>
            </div>
          </>
        )}

        {config.type === 'multi' && config.options && (
          <>
            <MultiSelect options={config.options} selected={multiValues} onToggle={handleMultiToggle} />
            <div className="mt-8">
              <button
                onClick={() => { if (multiValues.length === 0) return; handleSave({ [getFieldName(apiStep)]: multiValues }); }}
                disabled={multiValues.length === 0 || saving}
                className="btn-primary w-full"
              >
                {saving ? '保存中...' : '下一步 →'}
              </button>
            </div>
          </>
        )}

        {config.type === 'height-weight' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">身高</label>
              <div className="relative">
                <input type="number" value={height} onChange={e => setHeight(e.target.value)}
                  placeholder="170" min={90} max={250} className="input-field text-lg pr-14" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
              </div>
              <p className="text-xs text-gray-300 mt-1.5">范围 90 - 250 cm</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">体重</label>
              <div className="relative">
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="65" min={25} max={300} className="input-field text-lg pr-14" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
              </div>
              <p className="text-xs text-gray-300 mt-1.5">范围 25 - 300 kg</p>
            </div>
            <button
              onClick={() => {
                const h = parseFloat(height), w = parseFloat(weight);
                if (isNaN(h) || isNaN(w)) { alert('请输入有效数值'); return; }
                if (h < 90 || h > 250) { alert('身高需在 90-250cm'); return; }
                if (w < 25 || w > 300) { alert('体重需在 25-300kg'); return; }
                handleSave({ height: h, weight: w });
              }}
              disabled={saving} className="btn-primary w-full mt-6"
            >
              {saving ? '保存中...' : '下一步 →'}
            </button>
          </div>
        )}

        {config.type === 'goal-weight-age' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">目标体重</label>
              <div className="relative">
                <input type="number" value={goalWeight} onChange={e => setGoalWeight(e.target.value)}
                  placeholder="60" min={25} max={300} className="input-field text-lg pr-14" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
              </div>
              <p className="text-xs text-gray-300 mt-1.5">范围 25 - 300 kg</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">年龄</label>
              <div className="relative">
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  placeholder="25" min={13} max={100} className="input-field text-lg pr-14" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">岁</span>
              </div>
              <p className="text-xs text-gray-300 mt-1.5">范围 13 - 100 岁</p>
            </div>
            <button
              onClick={() => {
                const gw = parseFloat(goalWeight), a = parseInt(age, 10);
                if (isNaN(gw) || isNaN(a)) { alert('请输入有效数值'); return; }
                if (gw < 25 || gw > 300) { alert('目标体重需在 25-300kg'); return; }
                if (a < 13 || a > 100) { alert('年龄需在 13-100 岁'); return; }
                handleSave({ goalWeight: gw, targetAge: a });
              }}
              disabled={saving} className="btn-primary w-full mt-6"
            >
              {saving ? '计算中...' : '查看我的计划 ✨'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function getFieldName(apiStep: number): string {
  const map: Record<number, string> = {
    2: 'gender', 3: 'dailyActivity', 4: 'energyLevel',
    5: 'waterIntake', 6: 'sleepHours', 7: 'breakfastTime',
    8: 'lunchTime', 9: 'dinnerTime', 10: 'dietType',
    11: 'badHabits', 12: 'lifeEvents', 13: 'upcomingEvent',
    14: '', 15: '',
  };
  return map[apiStep] || '';
}
