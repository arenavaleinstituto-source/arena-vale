/** Regulamento do campeonato em texto corrido. */
export function TextoRegulamento({ secoes }: { secoes: { titulo: string; paragrafos: string[] }[] }) {
  return (
    <div className="grid max-w-3xl gap-6">
      {secoes.map((s) => (
        <section key={s.titulo} className="grid gap-2">
          <h3 className="font-display text-xl font-extrabold uppercase">{s.titulo}</h3>
          {s.paragrafos.map((p, i) => (
            <p key={i} className="leading-relaxed text-av-branco/90">
              {p}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
