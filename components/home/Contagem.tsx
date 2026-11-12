'use client';

import { useSyncExternalStore } from 'react';

function restante(alvo: string, agora: number) {
  const ms = Math.max(0, Date.parse(alvo) - agora);
  const min = Math.floor(ms / 60000);
  return { ms, dias: Math.floor(min / 1440), horas: Math.floor((min % 1440) / 60), min: min % 60 };
}

const dois = (n: number) => String(n).padStart(2, '0');

const PASSO = 30000;
function assinarRelogio(avisar: () => void) {
  const t = setInterval(avisar, PASSO);
  return () => clearInterval(t);
}
/** Arredonda para o passo: o valor só muda a cada 30 s (o React exige leitura estável). */
const lerRelogio = () => Math.floor(Date.now() / PASSO) * PASSO;

/** Contagem regressiva até a próxima transmissão. Nunca fica negativa. */
export function Contagem({ alvo }: { alvo: string }) {
  // No servidor não há relógio: o servidor e o navegador mostram o mesmo "--" e o número entra depois de abrir.
  const agora = useSyncExternalStore(assinarRelogio, lerRelogio, () => null);
  const r = agora === null ? null : restante(alvo, agora);
  if (r && r.ms === 0) return <p className="contagem-agora">Começando agora</p>;
  const mostrar = (n: number | undefined) => (n === undefined ? '--' : dois(n));
  return (
    <div className="contagem" aria-label="Contagem regressiva">
      <div>
        <b>{mostrar(r?.dias)}</b>
        <span>dias</span>
      </div>
      <div>
        <b>{mostrar(r?.horas)}</b>
        <span>horas</span>
      </div>
      <div>
        <b>{mostrar(r?.min)}</b>
        <span>min</span>
      </div>
    </div>
  );
}
