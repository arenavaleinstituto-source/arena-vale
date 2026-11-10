/** Banner estático "Divulgue seu torneio na ARENA VALE": a imagem toda leva ao WhatsApp. */
export function BannerTorneio({ whatsapp }: { whatsapp: string }) {
  const link = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá! Quero divulgar o meu torneio na ARENA VALE.')}`;
  return (
    <section className="faixa" id="divulgue-seu-torneio" aria-label="Divulgue seu torneio">
      <div className="dentro">
        <a href={link} target="_blank" rel="noopener noreferrer" className="banner-torneio">
          <picture>
            <source media="(max-width: 700px)" srcSet="/banners/divulgue-torneio-celular.jpg" width={1080} height={1080} />
            {/* eslint-disable-next-line @next/next/no-img-element -- banner estático com versão de celular */}
            <img
              src="/banners/divulgue-torneio-largo.jpg"
              width={1600}
              height={500}
              loading="lazy"
              decoding="async"
              alt="Organizou um torneio? Divulgue seu torneio na ARENA VALE: jogos na agenda do site, notícias e resultados, divulgação nas redes. Fale com a gente pelo WhatsApp (47) 98844-4404."
            />
          </picture>
        </a>
      </div>
    </section>
  );
}
