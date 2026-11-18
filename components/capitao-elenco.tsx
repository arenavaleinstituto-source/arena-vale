'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cpfValido, formatarCpf, mascararCpf, soDigitos } from '@/lib/atletas/cpf';
import { reduzirImagem } from '@/lib/ui/imagem';
import { COLUNAS_ELENCO, paraElenco, type AtletaDoElenco } from '@/lib/atletas/elenco-campeonato';

export type { AtletaDoElenco };
export type OutraInscricao = { id: string; campeonatoNome: string };

type Props = { timeId: string; inscricaoId: string; elencoInicial: AtletaDoElenco[]; outrasInscricoes: OutraInscricao[] };

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'grid gap-1.5 text-sm text-av-cinza';

/** Elenco da equipe num campeonato: inscreve atletas pelo CPF (vale o primeiro time que inscrever) e copia o elenco de outro campeonato. */
export function CapitaoElenco({ timeId, inscricaoId, elencoInicial, outrasInscricoes }: Props) {
  const supabase = createClient();
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [elenco, setElenco] = useState<AtletaDoElenco[]>(elencoInicial);
  const [cpfs, setCpfs] = useState<Record<string, string>>({});
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [posicao, setPosicao] = useState('');
  const [numero, setNumero] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [origem, setOrigem] = useState(outrasInscricoes[0]?.id ?? '');
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  // CPFs só pela função protegida; na tela aparecem mascarados.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await supabase.rpc('cpfs_do_time', { t: timeId });
      if (vivo && Array.isArray(data)) setCpfs((c) => ({ ...Object.fromEntries((data as { id: string; cpf: string }[]).map((x) => [x.id, x.cpf])), ...c }));
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez por equipe
  }, [timeId]);

  async function recarregar(): Promise<AtletaDoElenco[]> {
    const { data } = await supabase.from('inscricao_atletas').select(COLUNAS_ELENCO).eq('inscricao_id', inscricaoId);
    const lista = paraElenco(data as unknown[] | null);
    setElenco(lista);
    return lista;
  }

  async function adicionarAtleta() {
    setMensagem(null);
    if (!nome.trim()) return setMensagem({ tipo: 'erro', texto: 'Informe o nome completo do atleta.' });
    if (!cpfValido(cpf)) return setMensagem({ tipo: 'erro', texto: 'CPF inválido. Confira os números.' });
    if (foto && (!foto.type.startsWith('image/') || foto.size > 5 * 1024 * 1024)) return setMensagem({ tipo: 'erro', texto: 'A foto precisa ser uma imagem de até 5 MB.' });

    setSalvando(true);
    let fotoUrl: string | null = null;
    if (foto) {
      const caminho = `${timeId}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('atletas-fotos').upload(caminho, await reduzirImagem(foto, 800), { contentType: 'image/jpeg' });
      if (error) {
        setSalvando(false);
        return setMensagem({ tipo: 'erro', texto: `Não consegui enviar a foto: ${error.message}` });
      }
      fotoUrl = supabase.storage.from('atletas-fotos').getPublicUrl(caminho).data.publicUrl;
    }

    const digitos = soDigitos(cpf);
    const { data, error } = await supabase.rpc('inscrever_atleta', {
      p_inscricao: inscricaoId,
      p_cpf: digitos,
      p_nome: nome.trim(),
      p_posicao: posicao.trim() || null,
      p_numero: numero ? Number(numero) : null,
      p_foto_url: fotoUrl,
    });
    if (error) {
      setSalvando(false);
      return setMensagem({ tipo: 'erro', texto: error.message });
    }
    const lista = await recarregar();
    setSalvando(false);
    const novo = lista.find((a) => a.linha === data);
    if (novo) setCpfs((c) => ({ ...c, [novo.id]: digitos }));
    setNome('');
    setCpf('');
    setPosicao('');
    setNumero('');
    setFoto(null);
    if (fileRef.current) fileRef.current.value = '';
    setMensagem({ tipo: 'ok', texto: 'Atleta adicionado.' });
  }

  async function copiarElenco() {
    if (!origem) return;
    setMensagem(null);
    setSalvando(true);
    const { data, error } = await supabase.rpc('copiar_elenco', { p_destino: inscricaoId, p_origem: origem });
    if (error) {
      setSalvando(false);
      return setMensagem({ tipo: 'erro', texto: error.message });
    }
    await recarregar();
    setSalvando(false);
    const n = Number(data) || 0;
    setMensagem({ tipo: 'ok', texto: n === 1 ? '1 atleta copiado.' : `${n} atletas copiados.` });
  }

  async function tirarDoElenco(a: AtletaDoElenco) {
    if (!confirm(`Tirar ${a.nome} do elenco deste campeonato?`)) return;
    const { error } = await supabase.from('inscricao_atletas').delete().eq('id', a.linha);
    if (error) return setMensagem({ tipo: 'erro', texto: `Erro: ${error.message}` });
    setElenco((l) => l.filter((x) => x.linha !== a.linha));
    setMensagem({ tipo: 'ok', texto: 'Atleta tirado do elenco.' });
  }

  return (
    <div className="grid gap-6">
      <div className="panel grid gap-4">
        <h2 className="font-display text-2xl font-extrabold uppercase">Adicionar atleta</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor={`${id}-nome`} className={ROTULO}>
            Nome completo do atleta
            <input id={`${id}-nome`} value={nome} onChange={(e) => setNome(e.target.value)} className={CAMPO} />
          </label>
          <label htmlFor={`${id}-cpf`} className={ROTULO}>
            CPF
            <input id={`${id}-cpf`} inputMode="numeric" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} placeholder="000.000.000-00" className={CAMPO} />
          </label>
          <label htmlFor={`${id}-pos`} className={ROTULO}>
            Posição (opcional)
            <input id={`${id}-pos`} value={posicao} onChange={(e) => setPosicao(e.target.value)} placeholder="Ex.: Ala, Pivô, Goleiro" className={CAMPO} />
          </label>
          <label htmlFor={`${id}-num`} className={ROTULO}>
            Número da camisa
            <input id={`${id}-num`} type="number" min={0} max={99} value={numero} onChange={(e) => setNumero(e.target.value)} className={CAMPO} />
          </label>
          <label htmlFor={`${id}-foto`} className={`${ROTULO} md:col-span-2`}>
            Foto do atleta
            <input
              id={`${id}-foto`}
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="text-sm text-av-branco file:mr-3 file:rounded-full file:border-0 file:bg-av-vermelho file:px-4 file:py-2 file:font-rotulo file:font-bold file:uppercase file:text-white"
            />
          </label>
        </div>
        <p className="text-xs text-av-cinza">
          O CPF completo fica guardado e protegido: só a coordenação e você têm acesso. Na lista aparecem apenas os 3 primeiros números. Um atleta só pode estar em um time por campeonato: vale o time que inscrever primeiro.
        </p>
        <button type="button" onClick={adicionarAtleta} disabled={salvando} className="btn-forte w-fit disabled:opacity-50">
          {salvando ? 'Salvando...' : '+ Adicionar atleta'}
        </button>
        {outrasInscricoes.length > 0 && (
          <div className="flex flex-wrap items-end gap-2 border-t border-av-linha pt-4">
            {outrasInscricoes.length > 1 && (
              <label htmlFor={`${id}-origem`} className={`${ROTULO} flex-1`}>
                Copiar de
                <select id={`${id}-origem`} value={origem} onChange={(e) => setOrigem(e.target.value)} className={CAMPO}>
                  {outrasInscricoes.map((o) => <option key={o.id} value={o.id}>{o.campeonatoNome}</option>)}
                </select>
              </label>
            )}
            <button type="button" onClick={copiarElenco} disabled={salvando} className="btn-leve disabled:opacity-50">
              Copiar elenco de outro campeonato
            </button>
          </div>
        )}
        {mensagem && (
          <p role={mensagem.tipo === 'erro' ? 'alert' : 'status'} className={`text-sm ${mensagem.tipo === 'erro' ? 'text-[#ff8a8f]' : 'text-av-branco'}`}>
            {mensagem.texto}
          </p>
        )}
      </div>

      <div className="panel grid gap-3">
        <h2 className="font-display text-2xl font-extrabold uppercase">Elenco neste campeonato · {elenco.length}</h2>
        {elenco.length === 0 && <p className="text-av-cinza">Nenhum atleta no elenco deste campeonato.</p>}
        {elenco.map((a) => (
          <div key={a.linha} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-av-linha bg-av-grafite-2 p-3">
            <div className="flex items-center gap-3">
              {a.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.foto_url} alt={a.nome} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 font-display font-black">{a.nome.slice(0, 1).toUpperCase()}</div>
              )}
              <div>
                <strong className="block">{a.nome}</strong>
                <small className="text-av-cinza">
                  {a.numero_camisa != null ? `Camisa ${a.numero_camisa} · ` : ''}
                  {a.posicao || 'Posição não informada'}
                </small>
                <small className="block text-av-cinza">CPF {mascararCpf(cpfs[a.id])}</small>
              </div>
            </div>
            <button type="button" onClick={() => tirarDoElenco(a)} className="btn-leve !py-1.5 !text-xs">
              Tirar do elenco
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
