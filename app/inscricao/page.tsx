'use client';
import { useState } from 'react';

const categorias = ['Sub-9','Sub-10','Sub-11','Sub-12','Sub-13','Sub-14','Sub-15','Sub-16','Sub-17','Sub-18','Sub-19','Sub-20'];
type Atleta = { nome: string; cpf: string; nascimento: string; posicao: string; camisa: string; foto?: File };
const vazio = (): Atleta => ({ nome: '', cpf: '', nascimento: '', posicao: '', camisa: '' });

export default function InscricaoPage() {
  const [atletas, setAtletas] = useState<Atleta[]>([vazio()]);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const atualizar = (i: number, campo: keyof Atleta, valor: string | File) => setAtletas(a => a.map((x, n) => n === i ? { ...x, [campo]: valor } : x));
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEnviando(true); setMensagem('');
    const form = new FormData(e.currentTarget);
    form.set('atletas', JSON.stringify(atletas.map(({ foto, ...a }) => a)));
    atletas.forEach((a, i) => { if (a.foto) form.set(`foto_${i}`, a.foto); });
    form.set('autorizacao_responsavel', 'true');
    const res = await fetch('/api/inscricoes', { method: 'POST', body: form });
    const data = await res.json();
    setMensagem(data.ok ? 'Inscrição enviada com sucesso. A equipe Arena Vale analisará os dados.' : data.error || 'Não foi possível enviar.');
    if (data.ok) e.currentTarget.reset();
    setEnviando(false);
  }
  return <main className="min-h-screen bg-[var(--bg)] px-6 py-16"><div className="mx-auto max-w-5xl">
    <a href="/" className="text-sm text-[var(--text-dim)]">← Voltar para Arena Vale</a>
    <p className="eyebrow mt-10">Arena Vale Sports</p><h1 className="heading mt-3">INSCRIÇÃO DE <span className="accent">EQUIPE</span></h1>
    <p className="mt-4 max-w-2xl text-[var(--text-dim)]">Cadastre sua equipe e seus atletas para participar dos campeonatos do Vale.</p>
    <form onSubmit={enviar} className="mt-10 space-y-8">
      <section className="panel grid gap-4 md:grid-cols-2"><h2 className="md:col-span-2 font-serif text-2xl font-bold">Dados da equipe</h2>
        <input className="field" name="equipe_nome" required placeholder="Nome da equipe" /><input className="field" name="equipe_sigla" maxLength={4} placeholder="Sigla" />
        <input className="field" name="cidade" placeholder="Cidade" /><select className="field" name="categoria" required defaultValue=""><option value="" disabled>Categoria</option>{categorias.map(c => <option key={c}>{c}</option>)}</select>
        <input className="field md:col-span-2" name="campeonato_id" placeholder="ID do campeonato (se informado pela organização)" />
      </section>
      <section className="panel grid gap-4 md:grid-cols-2"><h2 className="md:col-span-2 font-serif text-2xl font-bold">Responsável pela equipe</h2>
        <input className="field" name="responsavel_nome" required placeholder="Nome completo" /><input className="field" name="responsavel_cpf" required placeholder="CPF" />
        <input className="field" type="email" name="responsavel_email" required placeholder="E-mail" /><input className="field" name="responsavel_telefone" required placeholder="Telefone / WhatsApp" />
      </section>
      <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">Atletas</h2><button type="button" className="btn-outline" onClick={() => setAtletas(a => [...a, vazio()])}>+ Adicionar atleta</button></div>
        {atletas.map((a, i) => <div className="panel grid gap-3 md:grid-cols-6" key={i}><div className="md:col-span-6 flex justify-between"><strong>Atleta {i + 1}</strong>{atletas.length > 1 && <button type="button" className="text-sm text-red-300" onClick={() => setAtletas(x => x.filter((_, n) => n !== i))}>Remover</button>}</div>
          <input className="field md:col-span-2" required value={a.nome} onChange={e => atualizar(i,'nome',e.target.value)} placeholder="Nome completo" /><input className="field" required value={a.cpf} onChange={e => atualizar(i,'cpf',e.target.value)} placeholder="CPF" /><input className="field" required type="date" value={a.nascimento} onChange={e => atualizar(i,'nascimento',e.target.value)} /><input className="field" value={a.posicao} onChange={e => atualizar(i,'posicao',e.target.value)} placeholder="Posição" /><input className="field" value={a.camisa} onChange={e => atualizar(i,'camisa',e.target.value)} placeholder="Camisa" /><label className="md:col-span-2 text-sm text-[var(--text-dim)]">Foto individual<input className="mt-2 block w-full text-sm" required type="file" accept="image/*" onChange={e => e.target.files?.[0] && atualizar(i,'foto',e.target.files[0])} /></label>
        </div>)}
      </section>
      <section className="panel"><label className="flex gap-3 text-sm text-[var(--text-dim)]"><input required type="checkbox" />Confirmo que sou responsável legal ou possuo autorização dos responsáveis legais para enviar e armazenar os dados, CPFs e fotos dos atletas, inclusive menores de idade, para fins de inscrição esportiva.</label><button className="btn-primary mt-6" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar inscrição'}</button>{mensagem && <p className="mt-4 text-sm">{mensagem}</p>}</section>
    </form>
  </div></main>;
}
