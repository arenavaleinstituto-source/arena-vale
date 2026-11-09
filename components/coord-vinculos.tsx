'use client';

import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

type Cargo = 'moderador' | 'capitao';
type Campeonato = { id: string; nome: string; ano: number };
type Pessoa = { full_name?: string | null; email?: string | null } | null;
type Vinculo = {
  chave: string;
  profileId: string;
  campeonatoId: string;
  pessoa: Pessoa;
  equipe?: string | null;
  capitaoId?: string;
};

const TEXTO: Record<Cargo, { titulo: string; botao: string; ajuda: string }> = {
  moderador: {
    titulo: 'MODERADORES',
    botao: 'Convidar moderador',
    ajuda: 'O moderador lança os resultados (placar, gols, cartões e súmula) só do campeonato escolhido.',
  },
  capitao: {
    titulo: 'CAPITÃES',
    botao: 'Convidar capitão',
    ajuda: 'O capitão cadastra a própria equipe e a lista de jogadores no campeonato escolhido.',
  },
};

/** Convites por campeonato para moderadores e capitães (spec 5.3). */
export function CoordVinculos({ cargo }: { cargo: Cargo }) {
  const id = useId();
  const t = TEXTO[cargo];
  const [campeonatos, setCampeonatos] = useState<Campeonato[]>([]);
  const [campeonatoId, setCampeonatoId] = useState('');
  const [email, setEmail] = useState('');
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    const { data: camps } = await supabase.from('campeonatos').select('id, nome, ano').order('ano', { ascending: false });
    const lista = (camps ?? []) as Campeonato[];
    setCampeonatos(lista);
    setCampeonatoId((atual) => atual || lista[0]?.id || '');

    if (cargo === 'moderador') {
      const { data } = await supabase.from('campeonato_moderadores').select('profile_id, campeonato_id, profiles(full_name, email)');
      setVinculos(((data ?? []) as Record<string, unknown>[]).map((v) => ({
        chave: `${v.profile_id}-${v.campeonato_id}`,
        profileId: v.profile_id as string,
        campeonatoId: v.campeonato_id as string,
        pessoa: v.profiles as Pessoa,
      })));
    } else {
      const { data } = await supabase.from('time_capitaes').select('id, profile_id, campeonato_id, time_id, profiles(full_name, email), times(nome)');
      setVinculos(((data ?? []) as Record<string, unknown>[]).map((v) => ({
        chave: v.id as string,
        capitaoId: v.id as string,
        profileId: v.profile_id as string,
        campeonatoId: v.campeonato_id as string,
        pessoa: v.profiles as Pessoa,
        equipe: (v.times as { nome?: string } | null)?.nome ?? null,
      })));
    }
  }, [cargo]);

  useEffect(() => { void carregar(); }, [carregar]);

  async function convidar(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setOcupado(true);
    const alvo = email.trim();
    try {
      const resp = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alvo, cargo, campeonatoId }),
      });
      const corpo = (await resp.json()) as { ok: boolean; erro?: string };
      if (!corpo.ok) setMsg({ tipo: 'erro', texto: corpo.erro ?? 'Não foi possível enviar o convite.' });
      else {
        setMsg({ tipo: 'ok', texto: `Convite enviado para ${alvo}.` });
        setEmail('');
        await carregar();
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Não foi possível enviar o convite. Verifique sua conexão.' });
    } finally {
      setOcupado(false);
    }
  }

  async function remover(v: Vinculo) {
    const supabase = createClient();
    const { error } =
      cargo === 'moderador'
        ? await supabase.from('campeonato_moderadores').delete().eq('profile_id', v.profileId).eq('campeonato_id', v.campeonatoId)
        : await supabase.from('time_capitaes').delete().eq('id', v.capitaoId!);
    if (error) setMsg({ tipo: 'erro', texto: error.message });
    else await carregar();
  }

  const doCampeonato = vinculos.filter((v) => !campeonatoId || v.campeonatoId === campeonatoId);
  const nome = (p: Pessoa) => p?.full_name || p?.email || 'Sem nome';

  return (
    <section className="panel grid gap-5">
      <div>
        <h2 className="text-2xl font-black uppercase">{t.titulo}</h2>
        <p className="mt-1 text-sm text-[var(--text-dim)]">{t.ajuda}</p>
      </div>

      <form onSubmit={convidar} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label htmlFor={`${id}-camp`} className="grid gap-1.5 text-sm">
          Campeonato
          <select id={`${id}-camp`} value={campeonatoId} onChange={(e) => setCampeonatoId(e.target.value)} className="input">
            {campeonatos.map((c) => <option key={c.id} value={c.id}>{c.nome} ({c.ano})</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-email`} className="grid gap-1.5 text-sm">
          E-mail
          <input id={`${id}-email`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="pessoa@exemplo.com" />
        </label>
        <button type="submit" disabled={ocupado || !campeonatoId} className="btn btn-primary">{t.botao}</button>
      </form>

      {msg && <p role={msg.tipo === 'erro' ? 'alert' : 'status'} className={msg.tipo === 'erro' ? 'text-red-400' : 'text-emerald-300'}>{msg.texto}</p>}

      <ul className="grid gap-2">
        {doCampeonato.length === 0 && <li className="text-sm text-[var(--text-dim)]">Ninguém convidado neste campeonato ainda.</li>}
        {doCampeonato.map((v) => (
          <li key={v.chave} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3">
            <div>
              <p className="font-bold">{nome(v.pessoa)}</p>
              <p className="text-xs text-[var(--text-dim)]">{v.pessoa?.email}</p>
              {cargo === 'capitao' && <p className="text-xs">{v.equipe ? `Equipe cadastrada: ${v.equipe}` : 'Aguardando equipe'}</p>}
            </div>
            <button type="button" onClick={() => remover(v)} className="btn" aria-label={`Remover vínculo de ${nome(v.pessoa)}`}>
              Remover vínculo
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
