/** "Para marcas": citação blockquote centralizada com CTA para patrocínio. */
export function ParaMarcas({ whatsapp }: { whatsapp: string }) {
  const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero colocar minha marca no palco do esporte da ARENA VALE.')}`;
  return (
    <section className="faixa citacao-secao" id="marcas" style={{ background: '#0d0a0a' }}>
      <div className="dentro">
        <div className="citacao">
          <blockquote>
            Coloque sua marca no palco do esporte. Presença antes, durante e depois do jogo — para uma audiência que não apenas assiste ao esporte: vive o esporte.
          </blockquote>
          <cite>ARENA VALE · Patrocínio</cite>
          <div className="botoes" style={{ justifyContent: 'center', marginTop: '20px' }}>
            <a href={link} className="av-btn forte" target="_blank" rel="noopener noreferrer">
              Falar com a ARENA VALE
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
