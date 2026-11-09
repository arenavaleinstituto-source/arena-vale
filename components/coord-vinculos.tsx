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
    botao: 'Cadastrar moderador',
    ajuda: 'O moderador lança os resultados (placar, gols, cartões e súmula) só do campeonato escolhido.',
  },
  capitao: {
    titulo: 'CAPITÃES',
    botao: 'Cadastrar capitão',
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
  const [senha, setSenha] = useState('');
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  /** Busca campeonatos e vínculos (sem mexer no estado — quem chama aplica). */
  const buscar = useCallback(async (): Promise<{ lista: Campeonato[]; vinculos: Vinculo[] }> => {
    const supabase = createClient();
    const { data: camps } = await supabase.from('campeonatos').select('id, nome, ano').order('ano', { ascending: false });
    const lista = (camps ?? []) as Campeonato[];
    if (cargo === 'moderador') {
      const { data } = await supabase.from('campeonato_moderadores').select('profile_id, campeonato_id, profiles(full_name, email)');
      return {
        lista,
        vinculos: ((data ?? []) as Record<string, unknown>[]).map((v) => ({
          chave: `${v.profile_id}-${v.campeonato_id}`,
          profileId: v.profile_id as string,
          campeonatoId: v.campeonato_id as string,
          pessoa: v.profiles as Pessoa,
        })),
      };
    }
    const { data } = await supabase.from('time_capitaes').select('id, profile_id, campeonato_id, time_id, profiles(full_name, email), times(nome)');
    return {
      lista,
      vinculos: ((data ?? []) as Record<string, unknown>[]).map((v) => ({
        chave: v.id as string,
        capitaoId: v.id as string,
        profileId: v.profile_id as string,
        campeonatoId: v.campeonato_id as string,
        pessoa: v.profiles as Pessoa,
        equipe: (v.times as { nome?: string } | null)?.nome ?? null,
      })),
    };
  }, [cargo]);

  const aplicar = useCallback((d: { lista: Campeonato[]; vinculos: Vinculo[] }) => {
    setCampeonatos(d.lista);
    setCampeonatoId((atual) => atual || d.lista[0]?.id || '');
    setVinculos(d.vinculos);
  }, []);

  const carregar = useCallback(async () => aplicar(await buscar()), [aplicar, buscar]);

  useEffect(() => {
    let vivo = true;
    buscar().then((d) => { if (vivo) aplicar(d); });
    return () => { vivo = false; };
  }, [buscar, aplicar]);

  async function convidar(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (senha.length < 8) {
      setMsg({ tipo: 'erro', texto: 'A senha precisa ter pelo menos 8 caracteres.' });
      return;
    }
    setOcupado(true);
    const alvo = email.trim();
    try {
      const resp = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alvo, cargo, campeonatoId, senha }),
      });
      const corpo = (await resp.json()) as { ok: boolean; erro?: string; jaTinhaConta?: boolean };
      if (!corpo.ok) setMsg({ tipo: 'erro', texto: corpo.erro ?? 'Não foi possível cadastrar.' });
      else {
        setMsg({
          tipo: 'ok',
          texto: corpo.jaTinhaConta
            ? `${alvo} já tinha conta: entra com a senha que já usa.`
            : `Pronto: ${alvo} já pode entrar com o e-mail e a senha cadastrada.`,
        });
        setEmail('');
        setSenha('');
        await carregar();
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Não foi possível cadastrar. Verifique sua conexão.' });
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
        <p className="mt-1 text-sm text-[var(--text-dim)]">A pessoa entra pelo botão Entrar do site com este e-mail e a senha. Passe a senha a ela pelo WhatsApp.</p>
      </div>

      <form onSubmit={convidar} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
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
        <label htmlFor={`${id}-senha`} className="grid gap-1.5 text-sm">
          Senha
          <input id={`${id}-senha`} type="text" autoComplete="off" required value={senha} onChange={(e) => setSenha(e.target.value)} className="input" placeholder="mínimo 8 caracteres" />
        </label>
        <button type="submit" disabled={ocupado || !campeonatoId} className="btn-forte">{t.botao}</button>
      </form>

      {msg && <p role={msg.tipo === 'erro' ? 'alert' : 'status'} className={msg.tipo === 'erro' ? 'text-red-400' : 'text-emerald-300'}>{msg.texto}</p>}

      <ul className="grid gap-2">
        {doCampeonato.length === 0 && <li className="text-sm text-[var(--text-dim)]">Ninguém cadastrado neste campeonato ainda.</li>}
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
