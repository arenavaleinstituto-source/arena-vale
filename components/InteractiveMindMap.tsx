import React, { useState, useRef, useMemo } from 'react';
import {
  HeartHandshake,
  ShieldAlert,
  Unlink,
  FileEdit,
  Zap,
  Globe,
  BarChart3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Network,
  LayoutGrid,
  Move,
} from 'lucide-react';
import {
  MINDMAP_BRANCHES,
  SEVERITY_META,
  AuditLeafNode,
  MindMapBranch,
  Severity,
} from '../data/auditData';

interface InteractiveMindMapProps {
  completedIds: Set<string>;
  onToggleComplete: (id: string) => void;
  selectedNodeId: string | null;
  onSelectNode: (node: AuditLeafNode, branch: MindMapBranch) => void;
  readinessScore: number;
}

const ICON_MAP = {
  HeartHandshake,
  ShieldAlert,
  Unlink,
  FileEdit,
  Zap,
  Globe,
  BarChart3,
};

const CANVAS_W = 1840;
const CANVAS_H = 1360;
const CENTER_X = 920;
const CENTER_Y = 670;

interface PositionedBranch {
  branch: MindMapBranch;
  side: 'left' | 'right';
  x: number;
  y: number;
  leaves: {
    node: AuditLeafNode;
    x: number;
    y: number;
  }[];
}

export const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({
  completedIds,
  onToggleComplete,
  selectedNodeId,
  onSelectNode,
  readinessScore,
}) => {
  const [viewMode, setViewMode] = useState<'canvas' | 'tree'>('canvas');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'todos' | 'ps'>('todos');
  const [collapsedBranches, setCollapsedBranches] = useState<Set<string>>(new Set());

  // Pan & Zoom state for Canvas
  const [zoom, setZoom] = useState<number>(0.68);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const toggleBranchCollapse = (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedBranches((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) next.delete(branchId);
      else next.add(branchId);
      return next;
    });
  };

  // Precomputed crisp non-overlapping layout coordinates
  const positionedBranches = useMemo<PositionedBranch[]>(() => {
    const leftIds = ['projeto-social', 'seguranca-painel', 'links-conversao', 'conteudo-linguagem'];
    const rightIds = ['performance-midia', 'dominio-seo', 'analytics-operacao'];

    const result: PositionedBranch[] = [];

    // Left stack vertical cursor
    let leftCursorY = 78;
    leftIds.forEach((id) => {
      const branch = MINDMAP_BRANCHES.find((b) => b.id === id)!;
      const leaves = branch.items.map((node, idx) => ({
        node,
        x: 180,
        y: leftCursorY + idx * 68,
      }));
      const hubY =
        leaves.length > 0
          ? (leaves[0].y + leaves[leaves.length - 1].y) / 2
          : leftCursorY;
      leftCursorY = leaves[leaves.length - 1].y + 106;
      result.push({
        branch,
        side: 'left',
        x: 525,
        y: hubY,
        leaves,
      });
    });

    // Right stack vertical cursor (centered vertically)
    let rightCursorY = 175;
    rightIds.forEach((id) => {
      const branch = MINDMAP_BRANCHES.find((b) => b.id === id)!;
      const leaves = branch.items.map((node, idx) => ({
        node,
        x: 1660,
        y: rightCursorY + idx * 72,
      }));
      const hubY =
        leaves.length > 0
          ? (leaves[0].y + leaves[leaves.length - 1].y) / 2
          : rightCursorY;
      rightCursorY = leaves[leaves.length - 1].y + 128;
      result.push({
        branch,
        side: 'right',
        x: 1315,
        y: hubY,
        leaves,
      });
    });

    return result;
  }, []);

  const isNodeHighlighted = (node: AuditLeafNode, branchId: string) => {
    if (severityFilter === 'todos') return true;
    if (severityFilter === 'ps') return branchId === 'projeto-social';
    return node.severity === severityFilter;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-node-interactive="true"]')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleResetView = () => {
    setZoom(0.68);
    setPan({ x: 0, y: 0 });
  };

  const buildBezier = (x1: number, y1: number, x2: number, y2: number) => {
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b0e17] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* Top Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 bg-[#0f1320]/90 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mr-1">
            Filtrar Mapa:
          </span>
          {[
            { key: 'todos', label: 'Todos (24 Itens)', dot: '#ffffff' },
            { key: 'ps', label: 'Foco #projetosocial', dot: '#e50914' },
            { key: 'critico', label: 'Bloqueantes Críticos (6)', dot: '#ff3b47' },
            { key: 'alto', label: 'Alta Prioridade (9)', dot: '#fbbf24' },
          ].map((item) => {
            const active = severityFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSeverityFilter(item.key as Severity | 'todos' | 'ps')}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                    : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: active ? '#fff' : item.dot }}
                />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {/* View Switcher */}
          <div className="inline-flex rounded-xl border border-white/10 bg-[#07080c] p-1">
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="h-3.5 w-3.5 text-[#e50914]" />
              Mapa Radial
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 text-amber-400" />
              Árvore em Grade
            </button>
          </div>

          {viewMode === 'canvas' && (
            <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#07080c] p-1">
              <button
                type="button"
                title="Diminuir Zoom"
                onClick={() => setZoom((z) => Math.max(0.42, +(z - 0.1).toFixed(2)))}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-mono-code font-semibold text-slate-300 min-w-[48px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                title="Aumentar Zoom"
                onClick={() => setZoom((z) => Math.min(1.25, +(z + 0.1).toFixed(2)))}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Centralizar Mapa"
                onClick={handleResetView}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/15 transition inline-flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Ajustar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: INTERACTIVE RADIAL MIND MAP CANVAS */}
      {viewMode === 'canvas' ? (
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative h-[680px] sm:h-[760px] w-full overflow-hidden mindmap-dot-bg select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Subtle instruction hint */}
          <div className="pointer-events-none absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#07080c]/85 px-3.5 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
            <Move className="h-3.5 w-3.5 text-[#e50914]" />
            <span>Arraste o fundo para mover · Clique em qualquer nó para ver o código e correção</span>
          </div>

          {/* Legend Bottom Left */}
          <div className="pointer-events-none absolute left-4 bottom-4 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-[#07080c]/90 px-4 py-2 text-[11px] backdrop-blur-md">
            {(['critico', 'alto', 'medio', 'ajuste'] as Severity[]).map((sev) => (
              <span key={sev} className="inline-flex items-center gap-1.5 text-slate-300 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_META[sev].color }}
                />
                {SEVERITY_META[sev].label}
              </span>
            ))}
          </div>

          {/* Scaled & Panned Viewport */}
          <div className="flex h-full w-full items-center justify-center">
            <div
              style={{
                width: CANVAS_W,
                height: CANVAS_H,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
              className="relative shrink-0 transition-transform duration-75 ease-out"
            >
              {/* SVG Connectors Layer */}
              <svg
                width={CANVAS_W}
                height={CANVAS_H}
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                className="pointer-events-none absolute inset-0"
              >
                <defs>
                  {positionedBranches.map(({ branch }) => (
                    <linearGradient
                      key={`grad-${branch.id}`}
                      id={`grad-${branch.id}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor={branch.color} stopOpacity="0.85" />
                      <stop offset="100%" stopColor={branch.color} stopOpacity="0.35" />
                    </linearGradient>
                  ))}
                </defs>

                {positionedBranches.map(({ branch, side, x, y, leaves }) => {
                  const collapsed = collapsedBranches.has(branch.id);
                  const branchStartX = side === 'left' ? CENTER_X - 135 : CENTER_X + 135;
                  const branchEndX = side === 'left' ? x + 115 : x - 115;
                  const branchActive =
                    severityFilter === 'todos' ||
                    (severityFilter === 'ps' && branch.id === 'projeto-social') ||
                    branch.items.some((i) => i.severity === severityFilter);

                  return (
                    <g key={`lines-${branch.id}`} opacity={branchActive ? 1 : 0.18}>
                      {/* Center Hub -> Branch Hub */}
                      <path
                        d={buildBezier(branchStartX, CENTER_Y, branchEndX, y)}
                        fill="none"
                        stroke={branch.color}
                        strokeWidth={branch.id === 'projeto-social' ? 3.5 : 2.6}
                        strokeOpacity={0.75}
                      />
                      {branch.id === 'projeto-social' && (
                        <path
                          d={buildBezier(branchStartX, CENTER_Y, branchEndX, y)}
                          fill="none"
                          stroke="#ff6b72"
                          strokeWidth={2}
                          className="animate-dash-flow"
                        />
                      )}

                      {/* Branch Hub -> Leaves */}
                      {!collapsed &&
                        leaves.map((leaf) => {
                          const leafStartX = side === 'left' ? x - 115 : x + 115;
                          const leafEndX = side === 'left' ? leaf.x + 148 : leaf.x - 148;
                          const highlighted = isNodeHighlighted(leaf.node, branch.id);
                          const isDone = completedIds.has(leaf.node.id);

                          return (
                            <path
                              key={`leaf-line-${leaf.node.id}`}
                              d={buildBezier(leafStartX, y, leafEndX, leaf.y)}
                              fill="none"
                              stroke={isDone ? '#10b981' : branch.color}
                              strokeWidth={selectedNodeId === leaf.node.id ? 2.8 : 1.7}
                              strokeOpacity={highlighted ? (isDone ? 0.45 : 0.65) : 0.12}
                              strokeDasharray={isDone ? '4 4' : undefined}
                            />
                          );
                        })}
                    </g>
                  );
                })}
              </svg>

              {/* CENTRAL ROOT NODE */}
              <div
                data-node-interactive="true"
                style={{
                  left: CENTER_X - 140,
                  top: CENTER_Y - 82,
                  width: 280,
                }}
                className="absolute z-20 rounded-3xl border-2 border-[#e50914] bg-gradient-to-b from-[#171b29] via-[#0e111b] to-[#07080c] p-5 text-center shadow-[0_0_60px_rgba(229,9,20,0.45)]"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#ff4b52]">
                  <Sparkles className="h-3 w-3" /> MAPA MENTAL GO-LIVE
                </div>
                <h3 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-wide text-white leading-none">
                  ARENA VALE NO AR
                </h3>
                <p className="mt-1 text-[11px] text-slate-400 font-mono-code">
                  arena-vale.vercel.app
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Prontidão Atual:</span>
                  <span className="font-mono-code font-bold text-amber-400 text-sm">
                    {readinessScore}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#e50914] via-amber-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
              </div>

              {/* BRANCH NODES & LEAF CARDS */}
              {positionedBranches.map(({ branch, x, y, leaves }) => {
                const Icon = ICON_MAP[branch.iconName];
                const collapsed = collapsedBranches.has(branch.id);
                const doneCount = branch.items.filter((i) => completedIds.has(i.id)).length;
                const branchActive =
                  severityFilter === 'todos' ||
                  (severityFilter === 'ps' && branch.id === 'projeto-social') ||
                  branch.items.some((i) => i.severity === severityFilter);

                return (
                  <React.Fragment key={branch.id}>
                    {/* Branch Hub Node */}
                    <div
                      data-node-interactive="true"
                      onClick={(e) => toggleBranchCollapse(branch.id, e)}
                      style={{
                        left: x - 115,
                        top: y - 42,
                        width: 230,
                        borderColor: branch.color,
                        boxShadow: `0 12px 32px -8px ${branch.glow}`,
                        opacity: branchActive ? 1 : 0.25,
                      }}
                      className="absolute z-10 rounded-2xl border bg-[#111522]/95 p-3.5 transition hover:scale-[1.03] cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: `${branch.color}30`, color: branch.color }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <span
                              className="block text-[10px] font-black uppercase tracking-widest"
                              style={{ color: branch.color }}
                            >
                              RAMO {branch.number}
                            </span>
                            <h4 className="truncate text-xs font-extrabold uppercase text-white">
                              {branch.title}
                            </h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-slate-300 hover:bg-white/15"
                        >
                          {collapsed ? (
                            <ChevronRight className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[145px]">{branch.subtitle}</span>
                        <span className="font-mono-code font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">
                          {doneCount}/{branch.items.length}
                        </span>
                      </div>
                    </div>

                    {/* Leaf Task Nodes */}
                    {!collapsed &&
                      leaves.map(({ node, x: lx, y: ly }) => {
                        const sev = SEVERITY_META[node.severity];
                        const isDone = completedIds.has(node.id);
                        const isSelected = selectedNodeId === node.id;
                        const highlighted = isNodeHighlighted(node, branch.id);

                        return (
                          <div
                            key={node.id}
                            data-node-interactive="true"
                            onClick={() => onSelectNode(node, branch)}
                            style={{
                              left: lx - 148,
                              top: ly - 27,
                              width: 296,
                              opacity: highlighted ? 1 : 0.2,
                              borderColor: isSelected
                                ? '#ffffff'
                                : isDone
                                ? 'rgba(16, 185, 129, 0.45)'
                                : sev.border,
                            }}
                            className={`group absolute z-10 flex items-center justify-between gap-2.5 rounded-xl border bg-[#0d101a]/95 px-3 py-2.5 transition-all cursor-pointer hover:scale-[1.03] hover:bg-[#151a2b] ${
                              isSelected ? 'ring-2 ring-[#e50914] shadow-xl' : 'shadow-md'
                            }`}
                          >
                            <button
                              type="button"
                              title="Marcar item como resolvido"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleComplete(node.id);
                              }}
                              className="shrink-0 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                            >
                              {isDone ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Circle className="h-4 w-4" style={{ color: sev.color }} />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <p
                                className={`truncate text-xs font-bold ${
                                  isDone ? 'line-through text-slate-500' : 'text-slate-100'
                                }`}
                              >
                                {node.shortLabel}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2 text-[10px]">
                                <span
                                  className="font-bold uppercase tracking-wider"
                                  style={{ color: isDone ? '#10b981' : sev.color }}
                                >
                                  {isDone ? 'Concluído' : sev.label}
                                </span>
                                <span className="text-slate-500">•</span>
                                <span className="font-mono-code text-slate-400">{node.effort}</span>
                              </div>
                            </div>

                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition" />
                          </div>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: RESPONSIVE STRUCTURED MIND-MAP TREE GRID */
        <div className="p-6 sm:p-8 space-y-6 arena-grid-bg">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {MINDMAP_BRANCHES.map((branch) => {
              const Icon = ICON_MAP[branch.iconName];
              const visibleItems = branch.items.filter((item) =>
                isNodeHighlighted(item, branch.id)
              );
              if (visibleItems.length === 0) return null;

              const doneCount = branch.items.filter((i) => completedIds.has(i.id)).length;

              return (
                <div
                  key={branch.id}
                  className="rounded-2xl border border-white/10 bg-[#101420] p-5 flex flex-col justify-between shadow-xl"
                  style={{ borderTopWidth: 3, borderTopColor: branch.color }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${branch.color}22`, color: branch.color }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <span
                            className="text-[10px] font-black uppercase tracking-widest"
                            style={{ color: branch.color }}
                          >
                            RAMO {branch.number}
                          </span>
                          <h3 className="text-base font-extrabold uppercase text-white">
                            {branch.title}
                          </h3>
                        </div>
                      </div>
                      <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-mono-code font-bold text-slate-300">
                        {doneCount}/{branch.items.length}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-slate-400 leading-relaxed">{branch.summary}</p>

                    <div className="mt-4 space-y-2.5 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                      {visibleItems.map((node) => {
                        const sev = SEVERITY_META[node.severity];
                        const isDone = completedIds.has(node.id);
                        const isSelected = selectedNodeId === node.id;

                        return (
                          <div
                            key={node.id}
                            onClick={() => onSelectNode(node, branch)}
                            className={`relative ml-5 rounded-xl border p-3 transition cursor-pointer hover:bg-white/[0.05] ${
                              isSelected
                                ? 'border-[#e50914] bg-[#e50914]/10'
                                : 'border-white/10 bg-[#0a0d15]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleComplete(node.id);
                                  }}
                                  className="mt-0.5 shrink-0 cursor-pointer"
                                >
                                  {isDone ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                  ) : (
                                    <Circle className="h-4 w-4" style={{ color: sev.color }} />
                                  )}
                                </button>
                                <div>
                                  <p
                                    className={`text-xs font-bold leading-snug ${
                                      isDone ? 'line-through text-slate-500' : 'text-white'
                                    }`}
                                  >
                                    {node.title}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
                                    <span
                                      className="rounded px-1.5 py-0.5 font-bold uppercase"
                                      style={{
                                        backgroundColor: sev.bg,
                                        color: sev.color,
                                      }}
                                    >
                                      {sev.label}
                                    </span>
                                    <span className="font-mono-code text-slate-400">
                                      ⏱ {node.effort}
                                    </span>
                                    <span className="text-slate-500 truncate max-w-[140px]">
                                      {node.location}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
