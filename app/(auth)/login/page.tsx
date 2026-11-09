'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * PORTAL DE ACESSO
 *
 * ⚠️ REESCRITO — Antes esta tela validava credenciais fixas escritas dentro do
 * próprio arquivo, que é servido ao navegador:
 *
 *   • um e-mail de proprietário + palavra-passe
 *   • dois e-mails de coordenadores + palavra-passe
 *   • um e-mail de coordenador que entrava com QUALQUER senha
 *
 * (As credenciais em si foram removidas deste arquivo e precisam ser
 * recriadas no Authentication do Supabase.)
 *
 * Quem lesse o bundle JavaScript do site conseguia ver todas essas
 * credenciais. Além disso, o "login" só gravava em `localStorage` — nunca
 * criava a sessão Supabase que o `middleware.ts` exige. Ou seja: o login
 * do site não abria o painel, e as senhas estavam publicadas.
 *
 * AGORA a autenticação é real: `supabase.auth.signInWithPassword()`.
 * A sessão é gravada em cookie HttpOnly pelo @supabase/ssr e é exatamente
 * o que o `middleware.ts` verifica antes de liberar /painel,
 * /coordenador e /proprietario.
 *
 * AÇÃO NECESSÁRIA DO DONO (não pode ser feita pelo código):
 * as contas precisam existir no Authentication do Supabase, com estes
 * e-mails e as senhas escolhidas por você. Use
 * "Forgot password" / convite pelo painel do Supabase.
 */

export default function LoginPage() {
  // `useSearchParams` exige uma fronteira de Suspense para a página
  // poder ser pré-renderizada estaticamente pelo Next.js.
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07080c]" />}>
      <FormularioLogin />
    </Suspense>
  );
}

function FormularioLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMensagem('');
    setErro(null);

    try {
      const supabase = createClient();
      const { data, error: erroAuth } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (erroAuth) {
        setErro(
          erroAuth.message === 'Invalid login credentials'
            ? 'E-mail ou palavra-passe inválidos. Confira os dados e tente novamente.'
            : erroAuth.message
        );
        return;
      }

      if (!data.user) {
        setErro('Não foi possível iniciar a sessão. Tente novamente.');
        return;
      }

      setMensagem('Acesso autorizado. A redirecionar…');

      // Volta para a página que o usuário tentou abrir (parâmetro `next`),
      // ou para o painel editorial.
      const destino = searchParams.get('next') || '/painel';
      setTimeout(() => router.push(destino), 600);
    } catch (erroGenerico: any) {
      setErro(erroGenerico?.message || 'Não foi possível iniciar a sessão.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-clip">
      {/* CABEÇALHO */}

      {/* CONTEÚDO */}
      <main className="mx-auto max-w-md w-full px-6 py-12 flex-grow">
        <div className="rounded-[2.5rem] border border-white/15 bg-[#11141d] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e50914]/15 blur-3xl pointer-events-none" />

          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-3">
              ÁREA RESTRITA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Portal de Acesso
            </h1>
            <p className="text-xs text-[#8a92a6] mt-2 uppercase">
              Hierarquia: Proprietário, Coordenador, Moderador e Capitão
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-[11px] font-black uppercase tracking-wider text-[#cad0e0] mb-2"
              >
                E-mail de Acesso
              </label>
              <input
                id="login-email"
                name="email"
                autoComplete="username"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="acesso@arenavale.com"
                className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-black uppercase tracking-wider text-[#cad0e0] mb-2"
              >
                Palavra-passe
              </label>
              <input
                id="login-password"
                name="password"
                autoComplete="current-password"
                required
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/15 bg-[#07080c] px-4 py-3.5 text-xs text-white placeholder:text-white/20 focus:border-[#e50914] focus:outline-none transition"
              />
            </div>

            {mensagem && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-center text-xs font-bold text-emerald-300">
                {mensagem}
              </div>
            )}

            {erro && (
              <div className="rounded-xl bg-[#e50914]/10 border border-[#e50914]/30 p-3 text-center text-xs font-bold text-amber-300">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#e50914]/30 hover:scale-[1.02] transition disabled:opacity-60"
            >
              {carregando ? 'A verificar…' : 'Entrar no Painel 🔒'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="https://wa.me/5547988444404?text=Olá,%20preciso%20de%20suporte%20com%20o%20acesso%20ao%20painel%20da%20Arena%20Vale!"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black uppercase tracking-wider text-[#8a92a6] hover:text-white transition"
            >
              Suporte via WhatsApp ↗
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#050609] py-6 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Todos os direitos reservados. CNPJ: 40.694.741/0001-34
      </footer>
    </div>
  );
}
