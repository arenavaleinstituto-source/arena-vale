import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0c1f4a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 900,
          margin: '0 0 12px 0',
          letterSpacing: '4px'
        }}>
          ARENA VALE
        </h1>
        <p style={{
          color: '#d4a849',
          fontSize: '14px',
          letterSpacing: '6px',
          margin: '0 0 40px 0',
          fontWeight: 600
        }}>
          SPORTS
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            background: '#d4a849',
            color: '#0c1f4a',
            padding: '16px 40px',
            borderRadius: '999px',
            fontWeight: 800,
            textDecoration: 'none',
            fontSize: '16px',
            letterSpacing: '2px'
          }}
        >
          ENTRAR →
        </Link>
      </div>
    </main>
  );
}
