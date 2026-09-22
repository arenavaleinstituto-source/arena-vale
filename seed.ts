// Script de seed — popula o banco com dados demo
// Uso: npm run db:seed (requer SUPABASE_SERVICE_ROLE_KEY no .env.local)

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function hash(p: string) { return crypto.createHash('sha256').update(p).digest('hex'); }

async function main() {
  console.log('🌱 Seed iniciando…');

  // ===== Campeonatos =====
  const camps = [
    // Em andamento
    { nome: 'Copa Arena Vale 2026',     ano: 2026, categoria: 'Adulto',    status: 'em_andamento' },
    { nome: 'Liga Blumenau 2026',       ano: 2026, categoria: 'Adulto',    status: 'em_andamento' },
    { nome: 'Supercopa Vale 2026',      ano: 2026, categoria: 'Adulto',    status: 'fase_grupos' },
    { nome: 'Torneio de Inverno 2026',  ano: 2026, categoria: 'Sub-17',    status: 'em_andamento' },
    // Em breve
    { nome: 'Copa Verão 2027',          ano: 2027, categoria: 'Adulto',    status: 'em_andamento' },
    // Finalizado (histórico)
    { nome: 'Copa Inauguração 2025',    ano: 2025, categoria: 'Adulto',    status: 'finalizado' },
  ];
  const { data: campsDb } = await supabase.from('campeonatos').upsert(camps, { onConflict: 'nome,ano' }).select();
  console.log('✓ Campeonatos:', campsDb?.length);

  // ===== Times =====
  const times = [
    { nome: 'Vila Real FC',            sigla: 'VR', escudo_cor: '#a83232', cidade: 'Taubaté' },
    { nome: 'União FC',                sigla: 'UF', escudo_cor: '#1f7a3a', cidade: 'Caçapava' },
    { nome: 'Amigos FC',               sigla: 'AM', escudo_cor: '#c9a338', cidade: 'Pindamonhangaba' },
    { nome: 'Resenha FC',              sigla: 'RF', escudo_cor: '#7a1f3f', cidade: 'Tremembé' },
    { nome: 'Maria FC',                sigla: 'MA', escudo_cor: '#1e2d54', cidade: 'Jacareí' },
    { nome: 'Atlético JV',             sigla: 'AJ', escudo_cor: '#7a1f1f', cidade: 'São José' },
    { nome: 'Piçarras FC',             sigla: 'PI', escudo_cor: '#2d5a87', cidade: 'Caraguatatuba' },
    { nome: 'Taubaté City',            sigla: 'TA', escudo_cor: '#5a3d8a', cidade: 'Taubaté' },
  ];
  const { data: timesDb } = await supabase.from('times').upsert(times, { onConflict: 'sigla' }).select();
  console.log('✓ Times:', timesDb?.length);

  // ===== Patrocinadores =====
  const patrocinadores = [
    { nome: 'Sicredi Vale',         cota: 'Master', valor_mensal: 12000, logo_initials: 'SICREDI', logo_cor: '#16a34a', ativo: true },
    { nome: 'Barca Futebol Clube',  cota: 'Ouro',   valor_mensal: 6500,  logo_initials: 'BARCA',  logo_cor: '#1e40af', ativo: true },
    { nome: 'Premier Esportes',     cota: 'Prata',  valor_mensal: 3200,  logo_initials: 'PREMIER',logo_cor: '#dc2626', ativo: true },
    { nome: 'Vale+ Internet',       cota: 'Bronze', valor_mensal: 1800,  logo_initials: 'VALE+',  logo_cor: '#c9a338', ativo: true },
  ];
  const { data: patDb } = await supabase.from('patrocinadores').upsert(patrocinadores, { onConflict: 'nome' }).select();
  console.log('✓ Patrocinadores:', patDb?.length);

  // ===== Jogos (alguns com placar final, outros ao vivo) =====
  if (campsDb && timesDb && campsDb.length && timesDb.length >= 8) {
    const jogos = [
      { campeonato_id: campsDb[0].id, fase: 'classificacao', rodada: 13, data: new Date(Date.now() + 7 * 86400000).toISOString(), local: 'Estádio Municipal', time_casa_id: timesDb[0].id, time_visitante_id: timesDb[1].id, status: 'agendado' },
      { campeonato_id: campsDb[0].id, fase: 'classificacao', rodada: 13, data: new Date(Date.now() + 14 * 86400000).toISOString(), local: 'Arena Vale', time_casa_id: timesDb[0].id, time_visitante_id: timesDb[7].id, status: 'agendado' },
      { campeonato_id: campsDb[0].id, fase: 'classificacao', rodada: 12, data: new Date(Date.now() - 4 * 86400000).toISOString(), local: 'Estádio Municipal', time_casa_id: timesDb[0].id, time_visitante_id: timesDb[1].id, placar_casa: 2, placar_visitante: 1, status: 'finalizado' },
      { campeonato_id: campsDb[2].id, fase: 'classificacao', rodada: 10, data: new Date(Date.now() - 5 * 86400000).toISOString(), local: 'Arena Vale', time_casa_id: timesDb[2].id, time_visitante_id: timesDb[3].id, placar_casa: 2, placar_visitante: 1, status: 'finalizado' },
    ];
    const { data: jogDb } = await supabase.from('jogos').insert(jogos).select();
    console.log('✓ Jogos:', jogDb?.length);

    // ===== Súmula demo para o jogo finalizado =====
    if (jogDb && jogDb.length >= 3) {
      const j = jogDb[2];
      const sumulaContent = JSON.stringify({
        placar: { casa: j.placar_casa, visitante: j.placar_visitante },
        eventos: [
          { min: 12, tipo: 'gol', jogador: 'João Santos', time: 'casa' },
          { min: 45, tipo: 'gol', jogador: 'Marcos Pereira', time: 'visitante' },
          { min: 89, tipo: 'gol', jogador: 'Felipe Costa', time: 'casa' },
        ],
      });
      const { data: sumDb } = await supabase.from('sumulas').upsert({
        jogo_id: j.id,
        hash_conteudo: hash(sumulaContent),
        status: 'validada',
        arbitro_nome: 'Carlos Eduardo Silva',
        capitão_casa_nome: 'João Santos',
        capitão_visitante_nome: 'André Lima',
        validada_em: new Date().toISOString(),
      }, { onConflict: 'jogo_id' }).select();
      console.log('✓ Súmula:', sumDb?.length);
    }
  }

  console.log('🎉 Seed concluído!');
}

main().catch(e => { console.error(e); process.exit(1); });
