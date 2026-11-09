'use client';

import { useEffect, useState } from 'react';

function restante(alvo: string, agora: number) {
  const ms = Math.max(0, Date.parse(alvo) - agora);
  const min = Math.floor(ms / 60000);
  return { ms, dias: Math.floor(min / 1440), horas: Math.floor((min % 1440) / 60), min: min % 60 };
}

const dois = (n: number) => String(n).padStart(2, '0');

/** Contagem regressiva até a próxima transmissão. Nunca fica negativa. */
export function Contagem({ alvo }: { alvo: string }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const r = restante(alvo, agora);
  if (r.ms === 0) return <p className="contagem-agora">Começando agora</p>;
  return (
    <div className="contagem" aria-label="Contagem regressiva">
      <div>
        <b>{dois(r.dias)}</b>
        <span>dias</span>
      </div>
      <div>
        <b>{dois(r.horas)}</b>
        <span>horas</span>
      </div>
      <div>
        <b>{dois(r.min)}</b>
        <span>min</span>
      </div>
    </div>
  );
}
