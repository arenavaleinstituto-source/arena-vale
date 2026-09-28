import { Shield } from '@/components/shield';

export default async function SumulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-white pt-24 pb-12">
      <div className="container max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield size={80} />
          </div>
          <h1 className="font-serif text-3xl font-extrabold mb-2">Súmula #{id}</h1>
          <p className="text-[var(--text-dim)]">Arena Vale Sports</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--primary)]/20 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="font-serif text-xl font-bold mb-2">Súmula em processamento</h2>
          <p className="text-[var(--text-dim)] text-sm mb-6">
            Esta súmula será preenchida pelo moderador do time após o jogo.
            <br />Acesse o painel do coordenador para cadastrar a súmula.
          </p>
          <a
            href="/"
            className="inline-block bg-[var(--primary)] text-[#0a1530] font-bold px-6 py-3 rounded-full hover:bg-[var(--primary-light)] transition"
          >
            ← Voltar para a home
          </a>
        </div>
      </div>
    </main>
  );
}
