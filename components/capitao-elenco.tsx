'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cpfValido, formatarCpf, mascararCpf, soDigitos } from '@/lib/atletas/cpf';
import { reduzirImagem } from '@/lib/ui/imagem';
import { COLUNAS_JOGADOR, type Jogador } from '@/lib/atletas/colunas';


type Props = { timeId: string; jogadoresIniciais: Jogador[] };

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';
const ROTULO = 'grid gap-1.5 text-sm text-av-cinza';

/** Elenco da equipe do capitão: cadastra atletas com nome, CPF e foto (só na própria equipe). */
export function CapitaoElenco({ timeId, jogadoresIniciais }: Props) {
  const supabase = createClient();
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>(jogadoresIniciais);
  const [cpfs, setCpfs] = useState<Record<string, string>>({});
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [posicao, setPosicao] = useState('');
  const [numero, setNumero] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  // CPFs só pela função protegida; na tela aparecem mascarados.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await supabase.rpc('cpfs_do_time', { t: timeId });
      if (vivo && Array.isArray(data)) setCpfs(Object.fromEntries((data as { id: string; cpf: string }[]).map((x) => [x.id, x.cpf])));
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez por equipe
  }, [timeId]);

  async function adicionarJogador() {
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
    const { data, error } = await supabase
      .from('jogadores')
      .insert({ nome: nome.trim(), cpf: digitos, posicao: posicao.trim() || null, numero_camisa: numero ? Number(numero) : null, foto_url: fotoUrl, time_id: timeId })
      .select(COLUNAS_JOGADOR)
      .single();
    setSalvando(false);
    if (error) {
      const texto = error.code === '23505' ? 'Este CPF já está cadastrado em outra equipe. Fale com a coordenação.' : `Erro: ${error.message}`;
      return setMensagem({ tipo: 'erro', texto });
    }
    const novo = data as unknown as Jogador;
    setJogadores((l) => [...l, novo]);
    setCpfs((c) => ({ ...c, [novo.id]: digitos }));
    setNome('');
    setCpf('');
    setPosicao('');
    setNumero('');
    setFoto(null);
    if (fileRef.current) fileRef.current.value = '';
    setMensagem({ tipo: 'ok', texto: 'Atleta adicionado.' });
  }

  async function excluirJogador(j: Jogador) {
    if (!confirm(`Excluir ${j.nome} da equipe?`)) return;
    const { error } = await supabase.from('jogadores').delete().eq('id', j.id);
    if (error) return setMensagem({ tipo: 'erro', texto: `Erro: ${error.message}` });
    setJogadores((l) => l.filter((x) => x.id !== j.id));
    setMensagem({ tipo: 'ok', texto: 'Atleta excluído.' });
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
        <p className="text-xs text-av-cinza">O CPF fica protegido: só a coordenação e você veem, e na lista aparecem apenas os 2 últimos números.</p>
        <button type="button" onClick={adicionarJogador} disabled={salvando} className="btn-forte w-fit disabled:opacity-50">
          {salvando ? 'Salvando...' : '+ Adicionar atleta'}
        </button>
        {mensagem && (
          <p role={mensagem.tipo === 'erro' ? 'alert' : 'status'} className={`text-sm ${mensagem.tipo === 'erro' ? 'text-[#ff8a8f]' : 'text-av-branco'}`}>
            {mensagem.texto}
          </p>
        )}
      </div>

      <div className="panel grid gap-3">
        <h2 className="font-display text-2xl font-extrabold uppercase">Atletas da equipe · {jogadores.length}</h2>
        {jogadores.length === 0 && <p className="text-av-cinza">Nenhum atleta cadastrado.</p>}
        {jogadores.map((j) => (
          <div key={j.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-av-linha bg-av-grafite-2 p-3">
            <div className="flex items-center gap-3">
              {j.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={j.foto_url} alt={j.nome} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 font-display font-black">{j.nome.slice(0, 1).toUpperCase()}</div>
              )}
              <div>
                <strong className="block">{j.nome}</strong>
                <small className="text-av-cinza">
                  {j.numero_camisa != null ? `Camisa ${j.numero_camisa} · ` : ''}
                  {j.posicao || 'Posição não informada'}
                </small>
                <small className="block text-av-cinza">CPF {mascararCpf(cpfs[j.id])}</small>
              </div>
            </div>
            <button type="button" onClick={() => excluirJogador(j)} className="btn-leve !py-1.5 !text-xs">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
