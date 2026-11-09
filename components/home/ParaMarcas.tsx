/** "Para marcas" (spec Fase 3, seção 5, bloco 11): só o texto e o botão. */
export function ParaMarcas({ whatsapp }: { whatsapp: string }) {
  const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero colocar minha marca no palco do esporte da ARENA VALE.')}`;
  return (
    <section className="faixa" id="marcas">
      <div className="dentro">
        <div className="marcas">
          <div>
            <h2>
              Coloque sua marca no <em>palco do esporte.</em>
            </h2>
            <p>Presença antes, durante e depois do jogo — para uma audiência que não apenas assiste ao esporte, vive o esporte.</p>
            <div className="botoes">
              <a href={link} className="av-btn forte" target="_blank" rel="noopener noreferrer">
                Falar com a ARENA VALE
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
