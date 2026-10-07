const championships=[['🏆','EM ANDAMENTO','COPA ARENA VALE 2026','PRINCIPAL COMPETIÇÃO DA TEMPORADA · PONTOS CORRIDOS + MATA-MATA','12','66','R$ 15k','FASE DE GRUPOS','62%','12/03/2026','20/12/2026'],['⚽','EM ANDAMENTO','LIGA BLUMENAU 2026','CAMPEONATO REGIONAL DE PONTOS CORRIDOS · 4 TURNOS','10','90','R$ 8k','TURNO 2','45%','05/02/2026','30/11/2026'],['🥇','FASE DE GRUPOS','SUPERCOPA VALE 2026','TORNEIO ELIMINATÓRIO DOS CAMPEÕES REGIONAIS','8','15','R$ 20k','GRUPOS','80%','22/04/2026','15/11/2026'],['🌟','INSCRIÇÕES ABERTAS','TORNEIO DE INVERNO 2026','CATEGORIA SUB-17 E SUB-15 · FORMATO ELIMINATÓRIO EM JOGO ÚNICO','16','—','R$ 5k','INSCRIÇÕES','12/16','15/07/2026','30/09/2026'],['🔥','EM BREVE','COPA VERÃO 2027','ABERTURA DA TEMPORADA 2027 · PRÉ-INSCRIÇÃO EM DEZEMBRO','16','—','R$ 12k','AGUARDANDO','0%','10/01/2027','20/03/2027'],['🏅','FINALIZADO','COPA INAUGURAÇÃO 2025','TORNEIO DE ABERTURA DA ARENA VALE · CAMPEÃO: FÊNIX CLUB','8','14','R$ 6k','ENCERRADO','100%','15/08/2025','12/12/2025']];
const games=[['PRÓXIMA','HOJE · 19:30','FÊNIX CLUB','VALE UNITED','QUADRA 01'],['PRÓXIMA','HOJE · 20:30','ARENA FC','BLUMENAU 7','QUADRA 02'],['AGENDADA','AMANHÃ · 18:00','ESTRELA AZUL','LIONS SC','QUADRA 01']];

export default function PublicPage(){
  return (
    <main id="topo" className="min-h-screen bg-[#0a1830] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6">
        <a href="#topo" className="font-black tracking-[.2em]">ARENA VALE<br/><small className="text-xs text-[#d4a849]">SPORTS</small></a>
        <div className="flex gap-2 text-xs font-bold">
          <a href="/login" className="rounded-full bg-[#d4a849] px-4 py-3 text-[#0a1530]">PAINEL</a>
          <a href="/coordenador" className="rounded-full border border-[#a8b4cc] px-4 py-3">SAIR</a>
        </div>
      </header>

      <section className="relative mx-auto min-h-[590px] max-w-7xl overflow-hidden rounded-[2rem] px-6 py-28 lg:px-14">
        <img src="/foto-pro-site-1.jpg" alt="Atletas Arena Vale" className="absolute inset-0 h-full w-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/95 via-[#071426]/75 to-[#071426]/20"/>
        <div className="relative max-w-2xl">
          <div className="mb-7 flex items-center gap-5">
            <img src="/arena-logo-transparent.png" alt="Logo Arena Vale" className="h-24 w-auto object-contain"/>
            <p className="text-lg font-black leading-tight tracking-[.08em] text-[#d4a849]">COMPLEXO ESPORTIVO<br/>ARENA VALE</p>
          </div>
          <h1 className="text-6xl font-black uppercase leading-[.9] sm:
