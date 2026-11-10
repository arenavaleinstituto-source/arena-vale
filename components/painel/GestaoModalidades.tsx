'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fraseDaModalidade, slugDoNome } from '@/lib/midia/modalidades';
import { EVENTO_MODALIDADES } from '@/lib/midia/useModalidades';

type Linha = { slug: string; nome: string; frase: string | null; ordem: number; ativo: boolean };

const CAMPO = 'w-full rounded-2xl border border-av-linha bg-[#08080a] px-4 py-3 text-base text-av-branco outline-none focus:border-av-vermelho';

/** Painel do coordenador: cadastrar modalidades novas e esconder/mostrar as que já existem. */
export function GestaoModalidades() {
  const supabase = createClient();
  const [lista, setLista] = useState<Linha[]>([]);
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data } = await supabase.from('modalidades').select('slug,nome,frase,ordem,ativo').order('ordem');
      if (vivo && data) setLista(data as Linha[]);
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carrega uma vez
  }, []);

  async function adicionar() {
    setMensagem('');
    const limpo = nome.trim().replace(/\s+/g, ' ');
    const slug = slugDoNome(limpo);
    if (limpo.length < 2 || !slug) return setMensagem('Escreva o nome da modalidade (pelo menos 2 letras).');
    if (limpo.length > 40) return setMensagem('Nome muito longo (até 40 letras).');
    if (lista.some((m) => m.slug === slug || slugDoNome(m.nome) === slug)) return setMensagem('Essa modalidade já existe.');
    const nova: Linha = { slug, nome: limpo, frase: fraseDaModalidade(limpo), ordem: Math.max(0, ...lista.map((m) => m.ordem)) + 1, ativo: true };
    const { error } = await supabase.from('modalidades').insert(nova).select().single();
    if (error) {
      setMensagem(
        /relation|does not exist|schema cache/i.test(error.message)
          ? 'O cadastro de modalidades passa a funcionar depois da atualização do banco.'
          : error.code === '23505'
            ? 'Essa modalidade já existe.'
            : `Erro: ${error.message}`,
      );
      return;
    }
    setLista((l) => [...l, nova]);
    window.dispatchEvent(new Event(EVENTO_MODALIDADES));
    setNome('');
    setMensagem(`${limpo} adicionada. Ela já aparece no site e nos cadastros de campeonato e notícia.`);
  }

  async function alternar(m: Linha) {
    const { error } = await supabase.from('modalidades').update({ ativo: !m.ativo }).eq('slug', m.slug);
    if (error) return setMensagem(`Erro: ${error.message}`);
    setLista((l) => l.map((x) => (x.slug === m.slug ? { ...x, ativo: !m.ativo } : x)));
    window.dispatchEvent(new Event(EVENTO_MODALIDADES));
  }

  return (
    <div className="panel grid gap-4">
      <h2 className="font-display text-2xl font-extrabold uppercase">Modalidades</h2>
      <p className="text-sm text-av-cinza">
        As modalidades aparecem no menu &ldquo;Modalidades&rdquo; do site e nos cadastros de campeonato e notícia. Esconder tira do site sem apagar nada.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Nome da nova modalidade"
          className={CAMPO}
          value={nome}
          maxLength={40}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void adicionar();
          }}
          placeholder="Ex.: Beach Tennis, Handebol..."
        />
        <button type="button" className="btn-forte shrink-0" onClick={adicionar}>
          Adicionar modalidade
        </button>
      </div>
      {mensagem && (
        <p className="text-sm text-av-cinza" role="status">
          {mensagem}
        </p>
      )}
      <ul className="grid gap-2">
        {lista.map((m) => (
          <li key={m.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-av-linha px-4 py-3">
            <span className={m.ativo ? 'font-semibold text-av-branco' : 'text-av-cinza line-through'}>{m.nome}</span>
            <button
              type="button"
              className="btn-leve text-sm"
              aria-label={`${m.ativo ? 'Esconder' : 'Mostrar'} ${m.nome} ${m.ativo ? 'do' : 'no'} site`}
              onClick={() => alternar(m)}
            >
              {m.ativo ? 'Esconder' : 'Mostrar'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
