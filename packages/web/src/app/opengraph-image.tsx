import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'isBurner — Disposable Email Detection API';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        backgroundColor: '#06060a',
        fontFamily: 'monospace',
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          width: 60,
          height: 4,
          backgroundColor: '#00ff88',
          marginBottom: 40,
          borderRadius: 2,
        }}
      />

      {/* Logo */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#e2e2ea',
          marginBottom: 24,
          display: 'flex',
        }}
      >
        <span>is</span>
        <span style={{ color: '#00ff88' }}>Burner</span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: '#e2e2ea',
          lineHeight: 1.1,
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <span>Is this email</span>
        <span style={{ color: '#00ff88' }}>trash?</span>
      </div>

      {/* Subtext */}
      <div
        style={{
          fontSize: 24,
          color: '#8a8a9a',
          display: 'flex',
        }}
      >
        Disposable email detection API. One call. Sub-5ms.
      </div>
    </div>,
    { ...size }
  );
}
