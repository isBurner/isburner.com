import { describe, it, expect } from 'vitest';
import { detectLegitimateMx } from './legitimate-mx';

function mx(exchange: string, priority = 10): { exchange: string; priority: number } {
  return { exchange, priority };
}

describe('detectLegitimateMx', () => {
  it('detects Google Workspace (aspmx)', () => {
    const result = detectLegitimateMx([mx('aspmx.l.google.com', 1)]);
    expect(result.score).toBe(-0.3);
    expect(result.reason).toContain('Google Workspace');
  });

  it('detects Google Workspace (alt MX)', () => {
    const result = detectLegitimateMx([mx('alt1.gmail-smtp-in.l.google.com', 5)]);
    expect(result.score).toBe(-0.3);
    expect(result.reason).toContain('Google Workspace');
  });

  it('detects Microsoft 365', () => {
    const result = detectLegitimateMx([mx('company.mail.protection.outlook.com')]);
    expect(result.score).toBe(-0.3);
    expect(result.reason).toContain('Microsoft 365');
  });

  it('detects ProtonMail', () => {
    const result = detectLegitimateMx([mx('mail.protonmail.ch')]);
    expect(result.score).toBe(-0.3);
    expect(result.reason).toContain('ProtonMail');
  });

  it('detects Zoho Mail', () => {
    const result = detectLegitimateMx([mx('mx.zoho.com')]);
    expect(result.score).toBe(-0.3);
    expect(result.reason).toContain('Zoho');
  });

  it('detects Fastmail', () => {
    const result = detectLegitimateMx([mx('in1-smtp.messagingengine.com')]);
    expect(result.score).toBe(-0.3);
    expect(result.reason).toContain('Fastmail');
  });

  it('returns neutral for unknown MX provider', () => {
    const result = detectLegitimateMx([mx('mail.smallhost.example.com')]);
    expect(result.score).toBe(0);
    expect(result.reason).toBeNull();
  });

  it('returns neutral for empty records', () => {
    const result = detectLegitimateMx([]);
    expect(result.score).toBe(0);
    expect(result.reason).toBeNull();
  });

  it('handles trailing DNS dot', () => {
    const result = detectLegitimateMx([mx('aspmx.l.google.com.')]);
    expect(result.score).toBe(-0.3);
  });

  it('handles uppercase', () => {
    const result = detectLegitimateMx([mx('ASPMX.L.GOOGLE.COM')]);
    expect(result.score).toBe(-0.3);
  });

  it('finds legitimate provider among mixed records', () => {
    const result = detectLegitimateMx([
      mx('backup.somehost.com', 20),
      mx('alt1.gmail-smtp-in.l.google.com', 5),
    ]);
    expect(result.score).toBe(-0.3);
  });
});
