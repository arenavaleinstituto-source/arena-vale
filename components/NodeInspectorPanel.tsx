import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Copy,
  Check,
  Code2,
  AlertTriangle,
  Wrench,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  AuditLeafNode,
  MindMapBranch,
  SEVERITY_META,
  PHASE_META,
} from '../data/auditData';

interface NodeInspectorPanelProps {
  node: AuditLeafNode;
  branch: MindMapBranch;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onNavigateNode: (direction: 'prev' | 'next') => void;
}

export const NodeInspectorPanel: React.FC<NodeInspectorPanelProps> = ({
  node,
  branch,
  isCompleted,
  onToggleComplete,
  onNavigateNode,
}) => {
  const [copied, setCopied] = useState(false);
  const sev = SEVERITY_META[node.severity];
  const phase = PHASE_META[node.phase];

  const handleCopyCode = () => {
    if (!node.codeFix) return;
    navigator.clipboard.writeText(node.codeFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#121625] via-[#0d101b] to-[#080a11] p-6 sm:p-8 shadow-2xl">
      {/* Top Bar: Branch + Navigation + Status Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider"
            style={{
              backgroundColor: `${branch.color}25`,
              color: branch.color,
              border: `1px solid ${branch.color}55`,
            }}
          >
            Ramo {branch.number} · {branch.title}
          </span>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider"
            style={{
              backgroundColor: sev.bg,
              color: sev.color,
              border: `1px solid ${sev.border}`,
            }}
          >
            {sev.label}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold text-slate-300">
            {phase.badge}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateNode('prev')}
            title="Item anterior"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateNode('next')}
            title="Próximo item"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white transition cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleComplete(node.id)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30 hover:bg-[#ff1e27]'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Resolvido ✓
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" />
                Marcar Concluído
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {node.title}
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-[#e50914]" />
                Onde ocorre: <strong className="text-white">{node.location}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono-code text-amber-300">
                <Clock className="h-3.5 w-3.5" />
                Tempo estimado: {node.effort}
              </span>
              {node.liveUrl && (
                <a
                  href={node.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#ff4b52] hover:underline font-bold"
                >
                  Abrir URL inspecionada <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400 mb-1.5">
              <AlertTriangle className="h-4 w-4" />
              O Que Está Acontecendo Hoje
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{node.problem}</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400 mb-1.5">
              <Wrench className="h-4 w-4" />
              Ação Recomendada Para Colocar no Ar
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{node.solution}</p>
          </div>
        </div>

        {/* Right Column: Forensic Evidence + Code Snippet */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#07090f] p-4">
            <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Evidência Capturada na Varredura HTTP / HTML
            </span>
            <pre className="whitespace-pre-wrap break-words font-mono-code text-xs text-amber-300/95 bg-black/40 rounded-xl p-3 border border-white/5 leading-relaxed">
              {node.evidence}
            </pre>
          </div>

          {node.codeFix ? (
            <div className="rounded-2xl border border-white/15 bg-[#07090f] p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-400">
                  <Code2 className="h-4 w-4" />
                  Correção Pronta (Next.js / TSX)
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/15 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copiar Código
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto font-mono-code text-[11px] text-slate-200 bg-black/60 rounded-xl p-3.5 border border-white/5 leading-relaxed flex-1">
                {node.codeFix}
              </pre>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 flex items-center justify-between text-xs text-slate-400">
              <span>Etapa de operação editorial / configuração na Vercel</span>
              <span className="font-mono-code font-bold text-slate-300">{phase.title}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
