'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export type Coordenador = { id: string; nome: string; email: string };
type Props = { coordenadores: Coordenador[]; limite: number; donoId: string };

const cartao = 'rounded-[24px] border border-white/10 bg-[#151517] p-6';
const botao = 'rounded-full px-5 py-2.5 text-sm font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Área do proprietário: gestão da equipe de coordenação (spec 3.4 e 5.1).
 * O dono aparece como "Você" — nunca pelo nome do cargo.
 */
export function GestaoCoordenadores({ coordenadores, limite, donoId }: Props) {
  const router = useRouter();
  const id = useId();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [novoLimite, setNovoLimite] = useState(String(limite));
  const [confirmarRemocao, setConfirmarRemocao] = useState<string | null>(null);
  const [escolhendoQuemSai, setEscolhendoQuemSai] = useState(false);
  const [quemSai, setQuemSai] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const noLimite = coordenadores.length >= limite;
  const outros = coordenadores.filter((c) => c.id !== donoId);
  const n = Number.parseInt(novoLimite, 10);
  const precisaSair = Number.isFinite(n) ? Math.max(0, coordenadores.length - n) : 0;

  async function rodar(acao: () => Promise<string | null>, sucesso: string) {
    setOcupado(true);
    setMsg(null);
    try {
      const erro = await acao();
      if (erro) setMsg({ tipo: 'erro', texto: erro });
      else {
        setMsg({ tipo: 'ok', texto: sucesso });
        router.refresh();
      }
    } catch {
      setMsg({ tipo: 'erro', texto: 'Não foi possível concluir. Verifique sua conexão e tente de novo.' });
    } finally {
      setOcupado(false);
    }
  }

  function convidar(e: FormEvent) {
    e.preventDefault();
    const alvo = email.trim();
    if (senha.length < 8) return setMsg({ tipo: 'erro', texto: 'A senha precisa ter pelo menos 8 caracteres.' });
    let jaTinhaConta = false;
    void rodar(async () => {
      const resp = await fetch('/api/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alvo, cargo: 'coordenador', senha }),
      });
      const corpo = (await resp.json()) as { ok: boolean; erro?: string; jaTinhaConta?: boolean };
      if (!corpo.ok) return corpo.erro ?? 'Não foi possível cadastrar.';
      jaTinhaConta = corpo.jaTinhaConta === true;
      setEmail('');
      setSenha('');
      return null;
    }, '').then(() => {
      setMsg((m) =>
        m?.tipo === 'ok'
          ? { tipo: 'ok', texto: jaTinhaConta ? `${alvo} já tinha conta: entra com a senha que já usa.` : `Pronto: ${alvo} já pode entrar com o e-mail e a senha cadastrada.` }
          : m,
      );
    });
  }

  function remover(c: Coordenador) {
    setConfirmarRemocao(null);
    void rodar(async () => {
      const { error } = await createClient().rpc('definir_cargo', { perfil: c.id, cargo: 'autenticado' });
      return error?.message ?? null;
    }, `${c.nome} não faz mais parte da coordenação.`);
  }

  function salvarLimite(remover: string[]) {
    void rodar(async () => {
      const { error } = await createClient().rpc('definir_limite_coordenadores', { n, remover });
      if (!error) {
        setEscolhendoQuemSai(false);
        setQuemSai([]);
      }
      return error?.message ?? null;
    }, 'Limite atualizado.');
  }

  function pedirLimite(e: FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(n) || n < 1) return setMsg({ tipo: 'erro', texto: 'O limite mínimo é 1 coordenador.' });
    if (precisaSair > 0) return setEscolhendoQuemSai(true);
    salvarLimite([]);
  }

  return (
    <div className="grid gap-6">
      {msg && (
        <p role={msg.tipo === 'erro' ? 'alert' : 'status'} className={`rounded-2xl px-4 py-3 text-sm ${msg.tipo === 'erro' ? 'bg-[#e50914]/10 text-[#ff6b73]' : 'bg-emerald-500/10 text-emerald-300'}`}>
          {msg.texto}
        </p>
      )}

      <section className={cartao}>
        <h2 className="text-2xl font-black uppercase text-white">Coordenação</h2>
        <p className="mt-1 text-sm text-white/60">{coordenadores.length} de {limite} vagas ocupadas.</p>
        <ul className="mt-5 grid gap-3">
          {coordenadores.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{c.nome || c.email}</p>
                <p className="truncate text-sm text-white/50">{c.email}</p>
              </div>
              {c.id === donoId ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/70">Você</span>
              ) : confirmarRemocao === c.id ? (
                <span className="flex items-center gap-2">
                  <span className="text-sm text-white/70">Remover {c.nome || c.email} da coordenação?</span>
                  <button type="button" onClick={() => remover(c)} disabled={ocupado} className={`${botao} bg-[#e50914] text-white`} aria-label="Confirmar remoção">Confirmar</button>
                  <button type="button" onClick={() => setConfirmarRemocao(null)} className={`${botao} border border-white/20 text-white`}>Cancelar</button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmarRemocao(c.id)} aria-label={`Remover ${c.nome || c.email}`} className={`${botao} border border-white/20 text-white hover:border-[#e50914]`}>
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={cartao}>
        <h2 className="text-xl font-black uppercase text-white">Cadastrar coordenador</h2>
        <p className="mt-1 text-sm text-white/60">A pessoa entra pelo botão Entrar do site com este e-mail e a senha. Passe a senha a ela pelo WhatsApp.</p>
        <form onSubmit={convidar} className="mt-4 flex flex-wrap gap-3">
          <label htmlFor={`${id}-email`} className="sr-only">E-mail do novo coordenador</label>
          <input
            id={`${id}-email`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            disabled={noLimite}
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#08080a] px-4 py-3 text-white focus:border-[#e50914] focus:outline-none"
          />
          <label htmlFor={`${id}-senha`} className="sr-only">Senha do novo coordenador</label>
          <input
            id={`${id}-senha`}
            type="text"
            autoComplete="off"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="senha (mínimo 8 caracteres)"
            disabled={noLimite}
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#08080a] px-4 py-3 text-white focus:border-[#e50914] focus:outline-none"
          />
          <button type="submit" disabled={noLimite || ocupado} className={`${botao} bg-[#e50914] text-white`}>Cadastrar coordenador</button>
        </form>
        {noLimite && <p className="mt-3 text-sm text-[#ff3b44]">Limite de {limite} coordenadores atingido — aumente o limite para cadastrar mais.</p>}
      </section>

      <section className={cartao}>
        <h2 className="text-xl font-black uppercase text-white">Limite de coordenadores</h2>
        <p className="mt-1 text-sm text-white/60">O normal são 3 pessoas (você + 2). Você pode aumentar ou diminuir quando precisar.</p>
        <form onSubmit={pedirLimite} className="mt-4 flex flex-wrap items-end gap-3">
          <label htmlFor={`${id}-limite`} className="grid gap-1.5 text-sm text-white/60">
            Limite de coordenadores
            <input
              id={`${id}-limite`}
              type="number"
              min={1}
              value={novoLimite}
              onChange={(e) => { setNovoLimite(e.target.value); setEscolhendoQuemSai(false); setQuemSai([]); }}
              className="w-28 rounded-2xl border border-white/10 bg-[#08080a] px-4 py-3 text-white focus:border-[#e50914] focus:outline-none"
            />
          </label>
          <button type="submit" disabled={ocupado} className={`${botao} border border-white/20 text-white`}>Salvar limite</button>
        </form>

        {escolhendoQuemSai && (
          <div className="mt-5 grid gap-3 rounded-2xl border border-[#e50914]/30 bg-[#e50914]/5 p-4">
            <p className="text-sm text-[#ff3b44]">Marque quem deixa de ser coordenador ({precisaSair} {precisaSair === 1 ? 'pessoa' : 'pessoas'}).</p>
            {outros.map((c) => (
              <label key={c.id} className="flex items-center gap-3 text-white">
                <input
                  type="checkbox"
                  checked={quemSai.includes(c.id)}
                  onChange={(e) => setQuemSai((atual) => (e.target.checked ? [...atual, c.id] : atual.filter((x) => x !== c.id)))}
                  aria-label={c.nome || c.email}
                />
                {c.nome || c.email}
              </label>
            ))}
            <button
              type="button"
              disabled={quemSai.length < precisaSair || ocupado}
              onClick={() => salvarLimite(quemSai)}
              className={`${botao} w-fit bg-[#e50914] text-white`}
            >
              Confirmar novo limite
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
