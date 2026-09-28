export default function SumulaPage({ params }: { params: { id: string } }) {
  return (
    <main style={{ minHeight: '100vh', background: '#08163a', color: 'white', padding: '100px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>📄</div>
        <h1 style={{ fontFamily: 'serif', fontSize: '32px', fontWeight: 900, marginBottom: '10px' }}>
          Súmula #{params.id}
        </h1>
        <p style={{ color: '#b6c4dc', marginBottom: '30px' }}>Arena Vale Sports</p>
        <div style={{ background: '#1a3370', border: '1px solid rgba(212,168,73,0.3)', borderRadius: '12px', padding: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>Súmula em processamento</h2>
          <p style={{ color: '#b6c4dc', fontSize: '14px' }}>
            Esta súmula será preenchida pelo moderador do time após o jogo.
          </p>
        </div>
        <a href="/" style={{ display: 'inline-block', marginTop: '24px', background: '#d4a849', color: '#0a1530', padding: '12px 24px', borderRadius: '999px', fontWeight: 700, textDecoration: 'none' }}>
          ← Voltar para a home
        </a>
      </div>
    </main>
  );
}
