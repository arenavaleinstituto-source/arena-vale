'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cargoDoBanco, destinoPorCargo, type Cargo } from '@/lib/auth/rotas';
import { ROTULO_CARGO, iniciais } from '@/lib/auth/mensagens';
import { FormEntrarEquipe } from './FormEntrarEquipe';

type Sessao = { nome: string; cargo: Cargo } | null;

function IconePessoa() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-white">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v1.5c0 .3.2.5.5.5h15c.3 0 .5-.2.5-.5V19c0-2.8-3.6-5-8-5Z" />
    </svg>
  );
}

/**
 * Botão "Entrar" do cabeçalho (spec 5.4). Visitante: abre o painel lateral
 * "Área da equipe". Logado: avatar com iniciais e cargo — o dono aparece
 * como "Coordenador", nunca pelo cargo real.
 */
export function EntrarEquipe() {
  const router = useRouter();
  const tituloId = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const [aberto, setAberto] = useState(false);
  const [menu, setMenu] = useState(false);
  const [sessao, setSessao] = useState<Sessao>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
        const perfil = data as { role?: string; full_name?: string } | null;
        const cargo = cargoDoBanco(perfil?.role ?? 'autenticado');
        if (vivo && ROTULO_CARGO[cargo]) setSessao({ nome: perfil?.full_name ?? '', cargo });
      } catch {
        /* sem sessão: mostra "Entrar" */
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    botaoRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aberto, fechar]);

  async function sair() {
    await createClient().auth.signOut();
    setSessao(null);
    setMenu(false);
    router.refresh();
  }

  if (sessao) {
    const painel = destinoPorCargo(sessao.cargo) ?? '/';
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenu((v) => !v)}
          aria-expanded={menu}
          aria-label={`Conta: ${ROTULO_CARGO[sessao.cargo]}`}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] py-1.5 pl-1.5 pr-4 transition hover:border-[#e50914]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#e50914] to-[#7a0b10] text-xs font-black text-white">
            {iniciais(sessao.nome)}
          </span>
          <span className="hidden text-left leading-tight sm:grid">
            <span className="max-w-[9rem] truncate text-xs font-bold text-white">{sessao.nome || 'Minha conta'}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/50">{ROTULO_CARGO[sessao.cargo]}</span>
          </span>
        </button>
        {menu && (
          <div className="absolute right-0 z-50 mt-3 w-52 rounded-2xl border border-white/15 bg-[#111111]/95 p-2 shadow-2xl backdrop-blur-2xl">
            <Link href={painel} onClick={() => setMenu(false)} className="block rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">
              Meu painel
            </Link>
            <button type="button" onClick={sair} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white">
              Sair
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto(true)}
        aria-haspopup="dialog"
        aria-label="Entrar na área da equipe"
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] py-1.5 pl-1.5 pr-4 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:border-[#e50914] hover:bg-[#e50914]/10 max-sm:pr-1.5"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e50914]"><IconePessoa /></span>
        <span className="max-sm:hidden">Entrar</span>
      </button>
      {aberto &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm" onClick={fechar} aria-hidden="true" />
            <aside
              role="dialog"
              aria-modal="true"
              aria-labelledby={tituloId}
              className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-[420px] flex-col gap-5 overflow-y-auto border-l border-white/10 bg-gradient-to-b from-[#17171a] to-[#0d0d0f] p-6 sm:rounded-l-[28px]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id={tituloId} className="text-3xl font-black uppercase leading-none text-white">ÁREA DA EQUIPE</h2>
                  <p className="mt-2 text-sm text-white/60">Coordenadores, moderadores e capitães</p>
                </div>
                <button type="button" onClick={fechar} aria-label="Fechar" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">✕</button>
              </div>
              <FormEntrarEquipe autoFocus />
            </aside>
          </>,
          document.body,
        )}
    </>
  );
}
