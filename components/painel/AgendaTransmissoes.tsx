'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useModalidades } from '@/lib/midia/useModalidades';

type Linha = { id: string; modalidade: string | null; equipe_casa: string; equipe_fora: string; data_hora: string; local: string | null; status: string | null };

const CAMPO = 'px-3 py-3 rounded-[10px] bg-[#08080a] border border-white/10 text-base text-av-branco';
const TRES_HORAS_MS = 3 * 3600 * 1000;

function quando(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(d);
}

/**
 * Transmissões avulsas (tabela `agenda_jogos`): jogos que a ARENA VALE transmite e que não
 * são de um campeonato cadastrado no site. Entram na agenda e no cartão "Próxima transmissão".
 */
export function AgendaTransmissoes() {
  const supabase = createClient();
  const modalidades = useModalidades();
  const [lista, setLista] = useState<Linha[]>([]);
  const [modalidade, setModalidade] = useState('');
  const [casa, setCasa] = useState('');
  const [fora, setFora] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [local, setLocal] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function buscar(): Promise<Linha[]> {
    const desde = new Date(Date.now() - TRES_HORAS_MS).toISOString();
    const { data } = await supabase.from('agenda_jogos').select('id,modalidade,equipe_casa,equipe_fora,data_hora,local,status').gte('data_hora', desde).order('data_hora');
    return ((data as Linha[] | null) ?? []).filter((l) => !/^cancelad/i.test((l.status ?? '').trim()));
  }

  async function carregar() {
    setLista(await buscar());
  }

  useEffect(() => {
    let vivo = true;
    (async () => {
      const linhas = await buscar();
      if (vivo) setLista(linhas);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez
  }, []);

  async function adicionar() {
    if (!casa.trim() || !fora.trim() || !dataHora) {
      setMensagem('Preencha as duas equipes e a data e hora.');
      return;
    }
    setSalvando(true);
    setMensagem('');
    const { error } = await supabase.from('agenda_jogos').insert({
      modalidade: modalidade || null,
      equipe_casa: casa.trim(),
      equipe_fora: fora.trim(),
      // O campo datetime-local vem no horário do computador (Brasília); o banco guarda com fuso.
      data_hora: new Date(dataHora).toISOString(),
      local: local.trim() || null,
      status: 'Agendado',
    });
    setSalvando(false);
    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return;
    }
    setMensagem('Transmissão adicionada. Aparece no site em até 1 minuto.');
    setCasa('');
    setFora('');
    setDataHora('');
    setLocal('');
    await carregar();
  }

  async function remover(l: Linha) {
    if (!window.confirm(`Remover ${l.equipe_casa} × ${l.equipe_fora} da agenda de transmissões?`)) return;
    const { error } = await supabase.from('agenda_jogos').delete().eq('id', l.id);
    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return;
    }
    setLista((atual) => atual.filter((x) => x.id !== l.id));
    setMensagem('Transmissão removida.');
  }

  return (
    <div className="panel">
      <h2 className="font-serif text-xl font-bold">📺 Transmissões avulsas</h2>
      <p className="mt-1 mb-5 text-sm text-av-cinza">
        Jogos transmitidos que não são de um campeonato do site. Entram na agenda e no cartão &quot;Próxima transmissão&quot; da página inicial. Para
        um jogo de campeonato, marque &quot;Terá transmissão&quot; nele, mais abaixo.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-av-cinza">
          Modalidade
          <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className={CAMPO}>
            <option value="">-</option>
            {modalidades.map((m) => (
              <option key={m.slug} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-av-cinza">
          Data e hora
          <input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} className={CAMPO} />
        </label>
        <label className="grid gap-1 text-sm text-av-cinza">
          Equipe da casa
          <input value={casa} onChange={(e) => setCasa(e.target.value)} className={CAMPO} placeholder="Ex.: Real Blumenau" />
        </label>
        <label className="grid gap-1 text-sm text-av-cinza">
          Equipe visitante
          <input value={fora} onChange={(e) => setFora(e.target.value)} className={CAMPO} placeholder="Ex.: Sede" />
        </label>
        <label className="grid gap-1 text-sm text-av-cinza md:col-span-2">
          Local (opcional)
          <input value={local} onChange={(e) => setLocal(e.target.value)} className={CAMPO} />
        </label>
      </div>

      <button onClick={adicionar} disabled={salvando} className="btn-primary mt-5">
        {salvando ? 'Salvando...' : '+ Adicionar transmissão'}
      </button>
      {mensagem && <p className="mt-4 text-sm text-[var(--primary)]">{mensagem}</p>}

      <h3 className="mt-6 mb-3 font-bold">Próximas transmissões avulsas</h3>
      {lista.length === 0 ? (
        <p className="text-sm text-[var(--text-mute)]">Nenhuma transmissão avulsa agendada.</p>
      ) : (
        <ul className="grid gap-2" aria-label="Transmissões avulsas">
          {lista.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
              <span>
                <strong>
                  {l.equipe_casa} × {l.equipe_fora}
                </strong>
                <small className="block text-xs text-[var(--text-mute)]">{[l.modalidade, quando(l.data_hora), l.local].filter(Boolean).join(' · ')}</small>
              </span>
              <button type="button" onClick={() => remover(l)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:border-av-vermelho">
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
