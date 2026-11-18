import { slugDoNome } from '@/lib/midia/modalidades';
import type { Criterio, OpcoesMataMata, Pontuacao, Regulamento, TipoPlacar } from './tipos';

export function slugCampeonato(nome: string, ano: number): string {
  const slug = slugDoNome(nome);
  const a = String(ano);
  if (slug === a || slug.endsWith(`-${a}`)) return slug;
  return slug ? `${slug}-${a}` : a;
}

type Secao = { titulo: string; paragrafos: string[] };

const pontos = (n: number) => `${n} ${n === 1 ? 'ponto' : 'pontos'}`;

export function fraseCriterio(c: Criterio, u: string): string {
  switch (c) {
    case 'vitorias': return 'mais vitórias';
    case 'saldo': return `melhor saldo de ${u}`;
    case 'pro': return `mais ${u} pró`;
    case 'contra': return `menos ${u} sofridos`;
    case 'confronto_direto': return 'confronto direto';
    case 'media_sets': return 'melhor média de sets';
    case 'media_pontos_sets': return 'melhor média de pontos nos sets';
    case 'sorteio': return 'sorteio';
  }
}

function formaDisputa(r: Regulamento, modalidade: string): string {
  const f = r.forma;
  if (f.tipo === 'pontos_corridos') {
    const base = `O campeonato de ${modalidade} é disputado em pontos corridos, em ${f.ida_volta ? 'ida e volta' : 'turno único'}.`;
    return f.final_entre ? `${base} Os ${f.final_entre} primeiros colocados disputam a fase final.` : base;
  }
  if (f.tipo === 'mata_mata') {
    return `O campeonato de ${modalidade} é disputado em mata-mata, em ${f.mata.ida_volta ? 'ida e volta' : 'jogo único'}.`;
  }
  const extras = f.melhores_extras > 0
    ? ` e os ${f.melhores_extras} melhores colocados entre os demais`
    : '';
  const passam = f.passam_por_grupo === 1 ? 'o 1º colocado de cada grupo' : `os ${f.passam_por_grupo} primeiros de cada grupo`;
  return (
    `O campeonato de ${modalidade} começa com ${f.grupos} grupos, em ${f.ida_volta_grupos ? 'ida e volta' : 'turno único'}. ` +
    `Avançam ${passam}${extras}, para o mata-mata.`
  );
}

function textoPontuacao(p: Pontuacao): string[] {
  if (p.tipo === 'gols') {
    return [`Vitória vale ${pontos(p.vitoria)}, empate ${pontos(p.empate)} e derrota ${pontos(p.derrota)}.`];
  }
  if (p.tipo === 'sets') {
    return [
      `Vitória por 2 sets a 0 (ou 3 a 0) vale ${pontos(p.vitoria_direta)}; vitória no set decisivo vale ${pontos(p.vitoria_decisivo)}.`,
      `Derrota no set decisivo vale ${pontos(p.derrota_decisivo)}; derrota sem set decisivo vale ${pontos(p.derrota)}.`,
    ];
  }
  return [`Vitória vale ${pontos(p.vitoria)} e derrota vale ${pontos(p.derrota)}.`];
}

function textoMata(m: OpcoesMataMata, t: TipoPlacar): string[] {
  const out: string[] = [];
  const idaVolta = m.ida_volta
    ? `As fases são em ida e volta${m.final_ida_volta ? ', inclusive a final' : ', exceto a final, que é em jogo único'}.`
    : `As fases são em jogo único${m.final_ida_volta ? ', exceto a final, que é em ida e volta' : ''}.`;
  out.push(idaVolta);
  out.push(m.terceiro_lugar ? 'Haverá disputa de 3º lugar.' : 'Não haverá disputa de 3º lugar.');
  if (t === 'sets') {
    out.push(`Os jogos são no formato melhor de ${m.sets_melhor_de} sets. Se o jogo empatar, o set de ouro decide.`);
  } else {
    const d = m.desempate;
    const regras: string[] = [];
    if (d.prorrogacao) regras.push('prorrogação');
    if (d.gol_fora && m.ida_volta) regras.push('gol fora de casa como critério');
    regras.push(d.final === 'penaltis' ? 'pênaltis' : 'melhor campanha');
    out.push(`Em caso de empate, a decisão segue esta ordem: ${regras.join(', depois ')}.`);
  }
  return out;
}

export function regulamentoEmTexto(r: Regulamento, nomeModalidade: string): Secao[] {
  const unidade = r.tipo_placar === 'sets' ? 'sets' : r.tipo_placar === 'cestas' ? 'cestas' : 'gols';
  const secoes: Secao[] = [
    { titulo: 'Forma de disputa', paragrafos: [formaDisputa(r, nomeModalidade)] },
    { titulo: 'Pontuação', paragrafos: textoPontuacao(r.pontuacao) },
    {
      titulo: 'Critérios de desempate',
      paragrafos: [`${r.criterios.map((c, i) => `${i + 1}º ${fraseCriterio(c, unidade)}`).join('; ')}.`],
    },
  ];

  const mata =
    r.forma.tipo === 'pontos_corridos' ? (r.forma.final_entre ? r.forma.mata : null) : r.forma.mata;
  if (mata) secoes.push({ titulo: 'Mata-mata', paragrafos: textoMata(mata, r.tipo_placar) });

  secoes.push({
    titulo: 'W.O.',
    paragrafos: [`Quem não comparece perde por W.O. O placar é ${r.wo_placar.vencedor} a ${r.wo_placar.perdedor} para o time presente.`],
  });

  const extras = r.regras_adicionais.trim();
  if (extras) {
    secoes.push({ titulo: 'Regras adicionais', paragrafos: extras.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) });
  }
  return secoes;
}
