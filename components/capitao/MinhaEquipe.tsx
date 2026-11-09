'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CapitaoElenco } from '@/components/capitao-elenco';

export type ConviteCapitao = {
  campeonatoId: string;
  campeonatoNome: string;
  time: { id: string; nome: string } | null;
  jogadores: unknown[];
};

function CadastrarEquipe({ convite }: { convite: ConviteCapitao }) {
  const router = useRouter();
  const id = useId();
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function cadastrar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const { error } = await createClient().rpc('criar_minha_equipe', {
        campeonato: convite.campeonatoId,
        nome: nome.trim(),
        sigla: sigla.trim(),
        escudo_url: null,
      });
      if (error) setErro(error.message);
      else router.refresh();
    } catch {
      setErro('Não foi possível cadastrar. Verifique sua conexão.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={cadastrar} className="grid gap-3">
      <h3 className="text-lg font-black uppercase">CADASTRAR MINHA EQUIPE</h3>
      <label htmlFor={`${id}-n`} className="grid gap-1.5 text-sm">Nome da equipe
        <input id={`${id}-n`} required value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
      </label>
      <label htmlFor={`${id}-s`} className="grid gap-1.5 text-sm">Sigla
        <input id={`${id}-s`} required maxLength={4} value={sigla} onChange={(e) => setSigla(e.target.value)} className="input w-28 uppercase" />
      </label>
      {erro && <p role="alert" className="text-sm text-red-400">{erro}</p>}
      <button type="submit" disabled={enviando} className="btn btn-primary w-fit">Cadastrar equipe</button>
    </form>
  );
}

/** Painel do capitão: a própria equipe e o elenco em cada campeonato convidado (spec 5.1). */
export function MinhaEquipe({ convites }: { convites: ConviteCapitao[] }) {
  if (convites.length === 0) {
    return <p className="panel text-center">Você ainda não foi convidado como capitão em nenhum campeonato. Fale com a coordenação.</p>;
  }
  return (
    <div className="grid gap-8">
      {convites.map((c) => (
        <section key={c.campeonatoId} className="panel grid gap-5">
          <h2 className="text-2xl font-black uppercase">{c.campeonatoNome}</h2>
          {c.time ? (
            <>
              <p className="text-sm text-[var(--text-dim)]">Equipe: <strong className="text-white">{c.time.nome}</strong></p>
              <CapitaoElenco timeId={c.time.id} jogadoresIniciais={c.jogadores} />
            </>
          ) : (
            <CadastrarEquipe convite={c} />
          )}
        </section>
      ))}
    </div>
  );
}
