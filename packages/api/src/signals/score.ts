import type { SignalResult } from './types';

export interface CompositeScore {
  score: number;
  reasons: string[];
}

export function computeCompositeScore(signals: SignalResult[]): CompositeScore {
  const rawSum = signals.reduce((acc, s) => acc + s.score, 0);
  const score = Math.max(0, Math.min(1, rawSum));
  const reasons = signals.filter((s) => s.reason !== null).map((s) => s.reason as string);
  return { score, reasons };
}
