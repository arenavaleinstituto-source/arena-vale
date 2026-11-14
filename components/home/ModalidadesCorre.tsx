const MODS = ['Futebol', 'Futsal', 'Society', 'Basquete', 'Vôlei'];

/** Faixa de modalidades correndo após o banner. */
export function ModalidadesCorre() {
  return (
    <div className="corre" aria-label="Modalidades">
      <div className="corre-fita" aria-hidden="true">
        {[...MODS, ...MODS].map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}
