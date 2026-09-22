// Súmula oficial — imprimível (A5 + térmica 80mm)
// Server Component: carrega a súmula do banco
import { notFound } from 'next/navigation';
import { getSumula } from '@/lib/supabase/queries';
import QRCode from 'qrcode';
import { Shield } from '@/components/shield';

export default async function SumulaPage({ params }: { params: { id: string } }) {
  const sumula = await getSumula(params.id).catch(() => null);
  if (!sumula) notFound();

  const j = (sumula as any).jogo;
  const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sumula/${sumula.id}/verificar`;
  const qrDataUrl = await QRCode.toDataURL(validationUrl, { width: 120, margin: 1 });

  return (
    <div className="min-h-screen bg-white text-black p-10 max-w-2xl mx-auto print:p-0 print:max-w-full">
      <header className="flex items-center gap-4 pb-3 border-b-2 border-[#c9a338] mb-4">
        <Shield size={50} />
        <div className="flex-1">
          <h1 className="font-serif text-xl tracking-wider text-[#0a1530] m-0">ARENA VALE SPORTS</h1>
          <h2 className="text-[10px] tracking-widest text-[#c9a338] font-bold m-0">SÚMULA OFICIAL DE PARTIDA</h2>
        </div>
        <div className="border-2 border-[#c9a338] rounded-md p-2 text-center">
          <span className="block text-[6pt] text-gray-500 tracking-widest">CÓDIGO</span>
          <strong className="font-serif text-sm text-[#0a1530] block">#{sumula.id.slice(0, 8).toUpperCase()}</strong>
          <small className="text-[7pt] text-gray-500 block mt-1">{new Date(j.data).toLocaleString('pt-BR')}</small>
        </div>
      </header>

      <section className="flex items-center gap-3 p-3 border-2 border-[#0a1530] rounded-md bg-gray-50 mb-3">
        <div className="flex-1 flex items-center gap-2 justify-end">
          <strong className="font-serif text-base tracking-wide">{j.time_casa.nome.toUpperCase()}</strong>
          <div className="w-10 h-10 rounded-full grid place-items-center text-[#0a1530] font-black text-sm border-2 border-[#0a1530]" style={{ background: j.time_casa.escudo_cor }}>{j.time_casa.sigla}</div>
        </div>
        <div className="flex items-center gap-1 font-serif font-black text-3xl leading-none">
          <span>{j.placar_casa}</span>
          <span className="text-[#c9a338] text-2xl">×</span>
          <span>{j.placar_visitante}</span>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full grid place-items-center text-[#0a1530] font-black text-sm border-2 border-[#0a1530]" style={{ background: j.time_visitante.escudo_cor }}>{j.time_visitante.sigla}</div>
          <strong className="font-serif text-base tracking-wide">{j.time_visitante.nome.toUpperCase()}</strong>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 mb-3 p-2 bg-gray-50 rounded">
        <div className="flex justify-between"><span className="text-[7pt] uppercase tracking-wider text-gray-500">Campeonato</span><strong className="text-[9pt]">{j.campeonato?.nome}</strong></div>
        <div className="flex justify-between"><span className="text-[7pt] uppercase tracking-wider text-gray-500">Local</span><strong className="text-[9pt]">{j.local}</strong></div>
        <div className="flex justify-between"><span className="text-[7pt] uppercase tracking-wider text-gray-500">Rodada</span><strong className="text-[9pt]">{j.rodada}ª</strong></div>
        <div className="flex justify-between"><span className="text-[7pt] uppercase tracking-wider text-gray-500">Árbitro</span><strong className="text-[9pt]">{j.arbitro || '—'}</strong></div>
      </section>

      <footer className="mt-5 pt-3 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="border-t border-black h-6 mb-1" />
          <small className="text-[7pt] text-gray-600">Assinatura do Árbitro</small>
        </div>
        <div className="text-center">
          <div className="border-t border-black h-6 mb-1" />
          <small className="text-[7pt] text-gray-600">Assinatura · {j.time_casa.nome}</small>
        </div>
        <div className="text-center">
          <div className="border-t border-black h-6 mb-1" />
          <small className="text-[7pt] text-gray-600">Assinatura · {j.time_visitante.nome}</small>
        </div>
      </footer>

      <div className="mt-6 pt-3 border-t border-dashed border-gray-300 text-center flex items-center justify-center gap-4">
        <img src={qrDataUrl} alt="QR" className="w-20 h-20" />
        <div className="text-left">
          <small className="block text-[6pt] text-gray-500">Validado digitalmente em {sumula.validada_em ? new Date(sumula.validada_em).toLocaleString('pt-BR') : '—'}</small>
          <small className="block text-[6pt] text-gray-500">SHA256: {sumula.hash_conteudo.slice(0, 24)}...</small>
          <small className="block text-[6pt] text-gray-500">arenavalesports.com.br</small>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 print:hidden">
        <button onClick={() => window.print()} className="bg-[#c9a338] text-[#0a1530] font-bold px-5 py-2.5 rounded-full hover:shadow-lg">
          🖨️ Imprimir
        </button>
      </div>
    </div>
  );
}
