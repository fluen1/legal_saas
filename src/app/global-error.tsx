'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="da">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '448px' }}>
            <h1 style={{ fontSize: '32px', color: '#1E3A5F', margin: 0 }}>
              Noget gik galt
            </h1>
            <p style={{ marginTop: '16px', fontSize: '16px', color: '#6b7280', lineHeight: 1.6 }}>
              Der opstod en kritisk fejl. Prøv at genindlæse siden.
            </p>
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#1E3A5F',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Prøv igen
              </button>
              <a
                href="/"
                style={{
                  padding: '12px 24px',
                  border: '1px solid #1E3A5F33',
                  color: '#1E3A5F',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Gå til forsiden
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
