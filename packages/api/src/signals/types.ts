/** A single scoring signal's contribution to the overall disposable score. */
export interface SignalResult {
  /** Unique identifier for this signal (e.g., 'blocklist', 'tld_risk', 'lexical'). */
  name: string;
  /** Weight contribution to the composite score. Can be negative (legitimacy signals). */
  score: number;
  /** Human-readable reason appended to the response reasons array. Null = not included. */
  reason: string | null;
}
