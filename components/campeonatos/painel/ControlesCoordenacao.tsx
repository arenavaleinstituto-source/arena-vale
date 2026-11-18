'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { slugDoNome } from '@/lib/midia/modalidades';
import { CAIXA, CAMPO, ROTULO, TITULO_BLOCO } from './estilos';

type Campeonato = { id: string; nome: string; slug: string; visivel: boolean; fases_destravadas: string[] };
type Vinculo = { profile_id: string; profiles: { full_name: string | null; email: string | null } | null };
type Perfil = { id: string; full_name: string | null; email: string | null };

const LIMITE = 3;
const nomeDe = (p: { full_name: string | null; email: string | null } | null | undefined) => p?.full_name || p?.email || 'Moderador';

/** O que só a ARENA VALE muda: liberar no site, endereço, destravar fase, moderadores e apagar. */
export function ControlesCoordenacao({ campeonato, fasesComResultado, onMudou, onApagado }: { campeonato: Campeonato; fasesComResultado: string[]; onMudou: () => void; onApagado?: () => void }) {
  const sb = createClient();
  const [visivel, setVisivel] = useState(campeonato.visivel);
  const [slug, setSlug] = useState(campeonato.slug);
  const [destravadas, setDestravadas] = useState(campeonato.fases_destravadas);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [moderadores, setModeradores] = useState<Perfil[]>([]);
  const [novo, setNovo] = useState('');
  const [confirmaNome, setConfirmaNome] = useState('');
  const [msg, setMsg] = useState('');

  async function buscarModeradores(): Promise<[Vinculo[], Perfil[]]> {
    const [{ data: v }, { data: p }] = await Promise.all([
      sb.from('campeonato_moderadores').select('profile_id, profiles(full_name, email)').eq('campeonato_id', campeonato.id),
      sb.from('profiles').select('id, full_name, email').eq('role', 'moderador').order('full_name'),
    ]);
    return [(v ?? []) as unknown as Vinculo[], (p ?? []) as Perfil[]];
  }
  async function carregarModeradores() {
    const [v, p] = await buscarModeradores();
    setVinculos(v);
    setModeradores(p);
  }

  useEffect(() => {
    let vivo = true;
    void buscarModeradores().then(([v, p]) => {
      if (!vivo) return;
      setVinculos(v);
      setModeradores(p);
    });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez por campeonato
  }, [campeonato.id]);

  async function mudar(campos: Record<string, unknown>, sucesso: string): Promise<boolean> {
    setMsg('');
    const { error } = await sb.from('campeonatos').update(campos).eq('id', campeonato.id);
    if (error) {
      setMsg(error.code === '23505' ? 'Este endereço já é de outro campeonato.' : `Não consegui salvar: ${error.message}`);
      return false;
    }
    setMsg(sucesso);
    onMudou();
    return true;
  }

  async function salvarEndereco() {
    const limpo = slugDoNome(slug);
    if (!limpo) return setMsg('Informe o endereço.');
    setSlug(limpo);
    await mudar({ slug: limpo }, 'Endereço salvo.');
  }

  async function destravar(fase: string, ligado: boolean) {
    const lista = ligado ? [...destravadas, fase] : destravadas.filter((f) => f !== fase);
    if (await mudar({ fases_destravadas: lista }, ligado ? `${fase} destravada.` : `${fase} travada de novo.`)) setDestravadas(lista);
  }

  async function adicionar() {
    if (!novo) return;
    setMsg('');
    const { error } = await sb.from('campeonato_moderadores').insert({ profile_id: novo, campeonato_id: campeonato.id });
    if (error) return setMsg(error.message);
    setNovo('');
    await carregarModeradores();
  }

  async function remover(profileId: string) {
    setMsg('');
    const { error } = await sb.from('campeonato_moderadores').delete().eq('profile_id', profileId).eq('campeonato_id', campeonato.id);
    if (error) return setMsg(error.message);
    await carregarModeradores();
  }

  async function apagar() {
    setMsg('');
    const { error } = await sb.from('campeonatos').delete().eq('id', campeonato.id);
    if (error) return setMsg(`Não consegui apagar: ${error.message}`);
    onApagado?.();
  }

  const livres = moderadores.filter((m) => !vinculos.some((v) => v.profile_id === m.id));

  return (
    <section aria-label="Controles da ARENA VALE" className="grid gap-5 rounded-xl border border-av-vermelho/40 p-4">
      <span className={TITULO_BLOCO}>Só a ARENA VALE</span>

      <label className={CAIXA}>
        <input type="checkbox" checked={visivel} onChange={async (e) => { const v = e.target.checked; if (await mudar({ visivel: v }, v ? 'Campeonato liberado no site.' : 'Campeonato escondido do site.')) setVisivel(v); }} />
        Visível no site
      </label>

      <div className="flex flex-wrap items-end gap-2">
        <label className={`${ROTULO} flex-1`}>
          Endereço no site
          <span className="flex items-center gap-1 text-av-cinza">
            /campeonatos/
            <input aria-label="Endereço no site" className={CAMPO} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </span>
        </label>
        <button type="button" className="btn-leve" onClick={salvarEndereco}>Salvar endereço</button>
      </div>

      {fasesComResultado.length > 0 && (
        <fieldset className="grid gap-2">
          <legend className={TITULO_BLOCO}>Destravar fase já começada</legend>
          <p className="text-xs text-av-cinza">Jogos com resultado nunca são apagados: só os jogos sem resultado da fase são recriados.</p>
          {fasesComResultado.map((f) => (
            <label key={f} className={CAIXA}>
              <input type="checkbox" checked={destravadas.includes(f)} onChange={(e) => destravar(f, e.target.checked)} aria-label={`Destravar ${f}`} />
              {f}
            </label>
          ))}
        </fieldset>
      )}

      <div className="grid gap-2">
        <span className={TITULO_BLOCO}>Moderadores do campeonato</span>
        <p className="text-sm text-av-cinza">{vinculos.length} de {LIMITE} moderadores</p>
        <ul className="grid gap-1">
          {vinculos.map((v) => (
            <li key={v.profile_id} className="flex items-center gap-2 text-sm">
              <span className="flex-1">{nomeDe(v.profiles)}</span>
              <button type="button" className="btn-leve px-3 py-1" onClick={() => remover(v.profile_id)} aria-label={`Desligar ${nomeDe(v.profiles)}`}>Desligar</button>
            </li>
          ))}
        </ul>
        {vinculos.length < LIMITE && (
          <div className="flex flex-wrap items-end gap-2">
            <label className={`${ROTULO} flex-1`}>
              Ligar um moderador
              <select className={CAMPO} value={novo} onChange={(e) => setNovo(e.target.value)}>
                <option value="">Escolha</option>
                {livres.map((m) => <option key={m.id} value={m.id}>{nomeDe(m)}</option>)}
              </select>
            </label>
            <button type="button" className="btn-leve" disabled={!novo} onClick={adicionar}>Adicionar</button>
          </div>
        )}
      </div>

      <div className="grid gap-2 border-t border-av-linha pt-4">
        <label className={ROTULO}>
          Para apagar, digite o nome do campeonato
          <input className={CAMPO} value={confirmaNome} onChange={(e) => setConfirmaNome(e.target.value)} />
        </label>
        <button type="button" className="w-fit rounded-full border border-av-vermelho px-4 py-2 font-rotulo text-sm font-bold uppercase tracking-wider text-av-vermelho-claro disabled:opacity-40" disabled={confirmaNome.trim() !== campeonato.nome} onClick={apagar}>
          Apagar campeonato
        </button>
      </div>

      {msg && <p role="status" className="text-sm text-av-amarelo">{msg}</p>}
    </section>
  );
}
