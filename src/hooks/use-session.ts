'use client';

import { useState, useEffect, useCallback } from 'react';
import type { StartResponse, AssessmentProgress } from '@/types';

const STORAGE_KEY = 'betterme_session';

interface SessionState {
  userId: string | null;
  sessionId: string | null;
  currentStep: number;
  status: string | null;
  loading: boolean;
  error: string | null;
}

function generateUUID(): string {
  // crypto.randomUUID 或降级方案
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadFromStorage(): { userId: string | null; sessionId: string | null } {
  if (typeof window === 'undefined') return { userId: null, sessionId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch { /* ignore */ }
  return { userId: null, sessionId: null };
}

function saveToStorage(userId: string, sessionId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, sessionId }));
  } catch { /* ignore */ }
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    userId: null,
    sessionId: null,
    currentStep: 0,
    status: null,
    loading: true,
    error: null,
  });

  // 初始化：调用 /api/assessment/start
  const initSession = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const stored = loadFromStorage();
      let sessionId = stored.sessionId;

      if (!sessionId) {
        sessionId = generateUUID();
      }

      const res = await fetch('/api/assessment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data: StartResponse = await res.json();

      // 持久化到 localStorage
      saveToStorage(data.userId, sessionId);

      setState({
        userId: data.userId,
        sessionId,
        currentStep: data.currentStep,
        status: data.status,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to initialize session',
      }));
    }
  }, []);

  // 获取进度（恢复用）
  const refreshProgress = useCallback(async () => {
    if (!state.userId) return;

    try {
      const res = await fetch(`/api/assessment/progress?userId=${state.userId}`);
      if (res.ok) {
        const data: AssessmentProgress = await res.json();
        setState(prev => ({
          ...prev,
          currentStep: data.currentStep,
          status: data.status,
        }));
      }
    } catch { /* ignore */ }
  }, [state.userId]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  return {
    ...state,
    refreshProgress,
  };
}
