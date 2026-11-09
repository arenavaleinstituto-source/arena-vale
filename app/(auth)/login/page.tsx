'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormEntrarEquipe } from '@/components/auth/FormEntrarEquipe';

/**
 * Área da equipe em tela cheia — para quem chega por redirecionamento
 * (`?next=`) ou link direto. O mesmo formulário do botão "Entrar" do cabeçalho:
 * o cargo é lido no banco e cada pessoa vai para o painel dela.
 */
function Conteudo() {
  const next = useSearchParams().get('next');
  return <FormEntrarEquipe next={next} autoFocus />;
}

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[75vh] w-full max-w-md content-center gap-6 px-5 py-14">
      <div className="grid gap-2">
        <span className="w-fit rounded-full border border-[#e50914]/40 bg-[#e50914]/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#ff6b73]">
          Coordenadores · Moderadores · Capitães
        </span>
        <h1 className="text-4xl font-black uppercase tracking-tight text-white">Área da equipe</h1>
        <p className="text-sm text-white/60">Entre com a sua conta. O site leva você direto ao seu painel.</p>
      </div>
      <div className="rounded-[28px] border border-white/10 bg-[#151517] p-6">
        <Suspense fallback={null}>
          <Conteudo />
        </Suspense>
      </div>
    </main>
  );
}
