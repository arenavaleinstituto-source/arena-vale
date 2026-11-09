'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MSG, mensagemDeErroLogin } from '@/lib/auth/mensagens';

/** Toques no fundo logo após abrir (ex.: 4º toque no logo) não fecham o modal. */
const CARENCIA_FECHAR_MS = 300;

type Props = { open: boolean; onClose: () => void };

/**
 * Modal de acesso aberto pelo toque triplo no logo.
 * Visual neutro: nenhum texto, title ou aria-label menciona o cargo de destino.
 * A proteção real da rota fica no proxy, nos Server Components e no RLS.
 */
export function OwnerLoginModal({ open, onClose }: Props) {
  // Desmonta ao fechar: senha e erro nunca reaparecem na próxima abertura.
  if (!open || typeof document === 'undefined') return null;
  return <ModalAberto onClose={onClose} />;
}

function ModalAberto({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const tituloId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const abertoEm = useRef(0);

  useEffect(() => {
    abertoEm.current = Date.now();
    emailRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);


  async function entrar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro(mensagemDeErroLogin(error));
        return;
      }
      router.push('/proprietario');
    } catch {
      setErro(MSG.conexao);
    } finally {
      setEnviando(false);
    }
  }

  // Portal no <body>: headers com backdrop-filter viram o bloco de contenção
  // de `position: fixed` e prenderiam o modal dentro da faixa do header.
  return createPortal(
    <div
      data-testid="acesso-restrito-fundo"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (Date.now() - abertoEm.current < CARENCIA_FECHAR_MS) return;
        onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#151517] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={tituloId} className="text-2xl font-black uppercase tracking-tight text-white">
            Acesso restrito
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <form onSubmit={entrar} className="grid gap-4">
          <label className="grid gap-1.5 text-sm text-white/60">
            E-mail
            <input
              ref={emailRef}
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#08080a] px-4 py-3 text-base text-white focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/30"
            />
          </label>
          <label className="grid gap-1.5 text-sm text-white/60">
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#08080a] px-4 py-3 text-base text-white focus:border-[#e50914] focus:outline-none focus:ring-2 focus:ring-[#e50914]/30"
            />
          </label>
          {erro && (
            <p role="alert" className="rounded-2xl bg-[#e50914]/10 px-4 py-2.5 text-sm text-[#ff6b73]">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-[#e50914] py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)] transition hover:bg-[#ff1f2b] disabled:opacity-60"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
