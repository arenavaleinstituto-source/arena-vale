import React, { useState } from 'react';
import {
  ExternalLink,
  Search,
  ShieldAlert,
  XCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { ROUTE_SCAN_RESULTS, RouteScanItem } from '../data/auditData';

export const RoutesAuditTable: React.FC = () => {
  const [filter, setFilter] = useState<'todos' | 'critico_erro' | 'alerta' | 'ok'>('todos');
  const [query, setQuery] = useState('');

  const filtered = ROUTE_SCAN_RESULTS.filter((item) => {
    const matchesQuery =
      item.path.toLowerCase().includes(query.toLowerCase()) ||
      item.finding.toLowerCase().includes(query.toLowerCase()) ||
      item.actionRequired.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (filter === 'critico_erro') {
      return item.statusType === 'critico' || item.statusType === 'erro';
    }
    if (filter === 'alerta') return item.statusType === 'alerta';
    if (filter === 'ok') return item.statusType === 'ok';
    return true;
  });

  const renderBadge = (item: RouteScanItem) => {
    if (item.statusType === 'critico') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/50 px-2.5 py-1 text-[10px] font-black uppercase text-red-300">
          <ShieldAlert className="h-3 w-3" /> HTTP {item.httpStatus} · Crítico
        </span>
      );
    }
    if (item.statusType === 'erro') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[10px] font-black uppercase text-rose-300">
          <XCircle className="h-3 w-3" /> HTTP {item.httpStatus} · Quebrado
        </span>
      );
    }
    if (item.statusType === 'alerta') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-1 text-[10px] font-black uppercase text-amber-300">
          <AlertTriangle className="h-3 w-3" /> HTTP {item.httpStatus} · Pendência
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-300">
        <CheckCircle2 className="h-3 w-3" /> HTTP {item.httpStatus} · OK
      </span>
    );
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0c0f19] p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#e50914]">
            VARREDURA TÉCNICA COMPLETA · 15 ENDPOINTS TESTADOS
          </span>
          <h2 className="mt-1 font-display text-3xl font-extrabold uppercase tracking-wide text-white">
            Conferência de Rotas, Arquivos & Respostas HTTP
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar rota ou erro..."
              className="rounded-xl border border-white/10 bg-[#07080c] pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#e50914]"
            />
          </div>

          <div className="inline-flex rounded-xl border border-white/10 bg-[#07080c] p-1">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'critico_erro', label: 'Erros / Críticos (5)' },
              { id: 'alerta', label: 'Alertas (8)' },
              { id: 'ok', label: 'OK (2)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setFilter(tab.id as 'todos' | 'critico_erro' | 'alerta' | 'ok')
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#e50914] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#121726] text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4">Rota / Recurso</th>
              <th className="py-3.5 px-4">Status & Peso</th>
              <th className="py-3.5 px-4">Diagnóstico Encontrado</th>
              <th className="py-3.5 px-4">O Que Fazer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {filtered.map((item) => (
              <tr
                key={item.path}
                className="hover:bg-white/[0.03] transition-colors align-top"
              >
                <td className="py-4 px-4 whitespace-nowrap">
                  <a
                    href={item.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono-code font-bold text-white hover:text-[#ff4b52] transition"
                  >
                    {item.path}
                    <ExternalLink className="h-3 w-3 text-slate-500" />
                  </a>
                  <span className="block text-[10px] text-slate-500 uppercase mt-0.5">
                    {item.category}
                  </span>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                  {renderBadge(item)}
                  <span className="block font-mono-code text-[11px] text-slate-400 mt-1">
                    Tamanho: {item.sizeLabel}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-300 leading-relaxed max-w-md">
                  {item.finding}
                </td>
                <td className="py-4 px-4 text-emerald-300/90 font-medium leading-relaxed max-w-xs">
                  {item.actionRequired}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
