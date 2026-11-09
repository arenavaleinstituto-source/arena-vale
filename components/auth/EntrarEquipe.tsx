'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cargoDoBanco, destinoPorCargo, type Cargo } from '@/lib/auth/rotas';
import { ROTULO_CARGO, iniciais } from '@/lib/auth/mensagens';
import { CARGOS_ENTRAR } from '@/lib/midia/menu';
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
 * Botão "Entrar" do cabeçalho (spec Fase 3, seção 4).
 * Visitante: abre o menu "ÁREA DA EQUIPE" (Coordenação / Moderador / Capitão);
 * cada opção abre o painel lateral de login. O rótulo é só visual — depois do
 * login o destino vem do cargo no banco (`destinoPorCargo`).
 * Logado: avatar com iniciais e cargo — o dono aparece como "Coordenador".
 */
export function EntrarEquipe() {
  const router = useRouter();
  const tituloId = useId();
  const menuId = useId();
  const botaoRef = useRef<HTMLButtonElement>(null);
  const caixaRef = useRef<HTMLDivElement>(null);
  const [cargoLogin, setCargoLogin] = useState<string | null>(null);
  const [menuEntrar, setMenuEntrar] = useState(false);
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

  const fecharLogin = useCallback(() => {
    setCargoLogin(null);
    botaoRef.current?.focus();
  }, []);

  // Esc fecha o que estiver aberto (login ou menu).
  useEffect(() => {
    if (!cargoLogin && !menuEntrar) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (cargoLogin) fecharLogin();
      else {
        setMenuEntrar(false);
        botaoRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cargoLogin, menuEntrar, fecharLogin]);

  // Toque ou clique fora fecha o menu. `pointerdown`: o iPhone não dispara `click` em áreas sem link.
  useEffect(() => {
    if (!menuEntrar) return;
    const fora = (e: Event) => {
      if (caixaRef.current && !caixaRef.current.contains(e.target as Node)) setMenuEntrar(false);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [menuEntrar]);

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
          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] p-1.5 transition hover:border-av-vermelho min-[1700px]:pr-4"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-av-vermelho to-[#7a0b10] text-xs font-black text-white">
            {iniciais(sessao.nome)}
          </span>
          <span className="hidden text-left leading-tight min-[1700px]:grid">
            <span className="max-w-[9rem] truncate text-xs font-bold text-white">{sessao.nome || 'Minha conta'}</span>
            <span className="text-[10px] uppercase tracking-widest text-white/50">{ROTULO_CARGO[sessao.cargo]}</span>
          </span>
        </button>
        {menu && (
          <div className="menu-entrar">
            <Link href={painel} onClick={() => setMenu(false)}>
              Meu painel
            </Link>
            <button type="button" onClick={sair} className="text-left">
              Sair
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="entrar-wrap" ref={caixaRef}>
      <button
        ref={botaoRef}
        type="button"
        className="entrar"
        onClick={() => setMenuEntrar((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menuEntrar}
        aria-controls={menuId}
        aria-label="Entrar na área da equipe"
      >
        <i aria-hidden="true">
          <IconePessoa />
        </i>
        <span>Entrar</span>
      </button>
      {menuEntrar && (
        <div className="menu-entrar" id={menuId} role="menu" aria-label="Área da equipe">
          <span className="me-tit">Área da equipe</span>
          {CARGOS_ENTRAR.map((cargo) => (
            <button
              key={cargo}
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuEntrar(false);
                setCargoLogin(cargo);
              }}
            >
              {cargo}
            </button>
          ))}
        </div>
      )}
      {cargoLogin &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div className="fundo-login" onClick={fecharLogin} aria-hidden="true" />
            <aside className="login" role="dialog" aria-modal="true" aria-labelledby={tituloId}>
              <div className="topo-l">
                <div>
                  <span className="cargo-l">Área da equipe · {cargoLogin}</span>
                  <h2 id={tituloId}>Entrar</h2>
                </div>
                <button type="button" className="fechar" onClick={fecharLogin} aria-label="Fechar">
                  ✕
                </button>
              </div>
              <FormEntrarEquipe autoFocus />
            </aside>
          </>,
          document.body,
        )}
    </div>
  );
}
