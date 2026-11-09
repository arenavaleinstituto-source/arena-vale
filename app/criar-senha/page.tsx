import type { Metadata } from 'next';
import { FormCriarSenha } from '@/components/auth/FormCriarSenha';

export const metadata: Metadata = {
  title: 'Criar sua senha | ARENA VALE',
  robots: { index: false, follow: false },
};

export default function CriarSenhaPage() {
  return (
    <main className="mx-auto grid min-h-[75vh] w-full max-w-md content-center gap-6 px-5 py-14">
      <h1 className="text-4xl font-black uppercase tracking-tight text-white">Criar sua senha</h1>
      <div className="rounded-[28px] border border-white/10 bg-[#151517] p-6">
        <FormCriarSenha />
      </div>
    </main>
  );
}
