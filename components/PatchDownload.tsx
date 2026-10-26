import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  FolderArchive,
  FileCode2,
  Check,
  Loader2,
  FolderTree,
  FileDown,
  Info,
} from 'lucide-react';
import { PATCH_FILES, PATCH_ZIP_NAME, PATCH_ROOT_FOLDER } from '../data/patchFiles';

type Status = 'idle' | 'building' | 'done' | 'error';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const PatchDownload: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [zipSize, setZipSize] = useState<number | null>(null);
  const [showTree, setShowTree] = useState(false);
  const [singleDone, setSingleDone] = useState<string | null>(null);

  const buildZip = async () => {
    try {
      setStatus('building');
      const zip = new JSZip();
      const root = zip.folder(PATCH_ROOT_FOLDER)!;
      PATCH_FILES.forEach((f) => {
        const isScript = f.path.endsWith('.sh');
        root.file(f.path, f.content, isScript ? { unixPermissions: '755' } : undefined);
      });
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
        platform: 'UNIX',
      });
      setZipSize(blob.size);
      triggerDownload(blob, PATCH_ZIP_NAME);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const downloadSingle = (path: string, content: string) => {
    const name = path.split('/').pop() || 'arquivo.txt';
    triggerDownload(new Blob([content], { type: 'text/plain;charset=utf-8' }), name);
    setSingleDone(path);
    setTimeout(() => setSingleDone(null), 1800);
  };

  // Build a simple folder tree for display
  const tree = PATCH_FILES.reduce<Record<string, string[]>>((acc, f) => {
    const parts = f.path.split('/');
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '(raiz)';
    (acc[dir] ||= []).push(parts[parts.length - 1]);
    return acc;
  }, {});

  const totalBytes = PATCH_FILES.reduce((s, f) => s + f.content.length, 0);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#e50914]/40 bg-gradient-to-br from-[#1a0c10] via-[#120c14] to-[#0a0d16] p-6 sm:p-8 shadow-[0_30px_90px_-30px_rgba(229,9,20,0.5)]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#e50914]/15 blur-3xl" />

      <div className="relative z-10 grid gap-7 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/12 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
            <FolderArchive className="h-3.5 w-3.5" />
            Pasta completa · gerada no seu navegador
          </span>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-[0.95]">
            Baixar a pasta
            <span className="block text-[#e50914]">arena-vale-patch.zip</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
            O arquivo é montado aqui mesmo, no momento do clique — não depende de nenhum servidor. Dentro vem a pasta{' '}
            <code className="font-mono-code text-amber-300">{PATCH_ROOT_FOLDER}/</code> com os{' '}
            <strong className="text-white">{PATCH_FILES.length} arquivos</strong> já nos caminhos do projeto Next.js, o{' '}
            <code className="font-mono-code text-white">LEIA-ME.md</code> e o script{' '}
            <code className="font-mono-code text-white">verificar-arena.sh</code>.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={buildZip}
              disabled={status === 'building'}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#e50914] px-7 py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/35 transition hover:bg-[#ff1e27] hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
            >
              {status === 'building' ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Compactando…
                </>
              ) : status === 'done' ? (
                <>
                  <Check className="h-5 w-5" /> Download iniciado
                </>
              ) : status === 'error' ? (
                <>
                  <Info className="h-5 w-5" /> Falhou — tente de novo
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" /> Baixar {PATCH_ZIP_NAME}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowTree((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-200 hover:bg-white/10 transition cursor-pointer"
            >
              <FolderTree className="h-4 w-4 text-amber-400" />
              {showTree ? 'Ocultar arquivos' : 'Ver arquivos / baixar um a um'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono-code text-[11px] text-slate-500">
            <span>{PATCH_FILES.length} arquivos</span>
            <span>{(totalBytes / 1024).toFixed(1)} KB descompactado</span>
            {zipSize !== null && <span className="text-emerald-400">zip gerado: {(zipSize / 1024).toFixed(1)} KB</span>}
            <span>formato: ZIP (DEFLATE)</span>
          </div>
        </div>

        {/* Quick steps */}
        <div className="lg:col-span-5 rounded-2xl border border-white/12 bg-black/45 p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Depois de baixar
          </span>
          <ol className="mt-3 space-y-2.5">
            {[
              ['Extraia o zip', 'A pasta arena-vale-patch/ aparece com app/, src/, public/ e os scripts.'],
              ['Copie o conteúdo para a raiz do projeto', 'Onde fica o package.json. Substitua os arquivos que já existirem.'],
              ['cp .env.example .env.local', 'Mantém a URL atual até o DNS do domínio próprio ativar.'],
              ['npm run build && npx vercel --prod', 'Ou git push na branch de produção.'],
              ['bash verificar-arena.sh', 'Confere tudo no ar com ✔/✘ e valor esperado.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#e50914]/25 font-mono-code text-[10px] font-black text-[#ff4b52]">
                  {i + 1}
                </span>
                <div>
                  <code className="block font-mono-code text-[11px] font-bold text-white">{t}</code>
                  <span className="text-[11px] text-slate-400">{d}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* File tree with individual downloads */}
      {showTree && (
        <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
              <FolderTree className="h-4 w-4 text-amber-400" />
              {PATCH_ROOT_FOLDER}/
            </span>
            <span className="text-[11px] text-slate-500">
              Clique no ícone para baixar o arquivo sozinho
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(tree).map(([dir, files]) => (
              <div key={dir} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5">
                <span className="block font-mono-code text-[11px] font-bold text-amber-300">
                  {dir === '(raiz)' ? './' : dir + '/'}
                </span>
                <ul className="mt-2 space-y-1">
                  {files.map((name) => {
                    const path = dir === '(raiz)' ? name : `${dir}/${name}`;
                    const file = PATCH_FILES.find((f) => f.path === path)!;
                    const done = singleDone === path;
                    return (
                      <li key={path} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
                        <span className="flex min-w-0 items-center gap-1.5 font-mono-code text-[11px] text-slate-200">
                          <FileCode2 className="h-3 w-3 shrink-0 text-slate-500" />
                          <span className="truncate">{name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadSingle(path, file.content)}
                          title={`Baixar ${name}`}
                          className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-[#e50914]/25 hover:text-white transition cursor-pointer"
                        >
                          {done ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <FileDown className="h-3.5 w-3.5" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
