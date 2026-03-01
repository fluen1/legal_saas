import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Retsklar — Er din virksomhed juridisk på plads?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2B5A8F 50%, #1E3A5F 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #D4A853, #E8C875, #D4A853)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 80px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-1px',
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Retsklar
          </div>

          <div
            style={{
              width: 80,
              height: 3,
              background: '#D4A853',
              marginBottom: 32,
            }}
          />

          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: '#E0E8F0',
              lineHeight: 1.4,
              maxWidth: 800,
            }}
          >
            Er din virksomhed juridisk på plads?
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: '#A0B4C8',
              marginTop: 24,
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            AI-drevet juridisk tjek af GDPR, ansættelsesret, selskabsforhold og kontrakter
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontSize: 18, color: '#A0B4C8' }}>
            retsklar.dk
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
