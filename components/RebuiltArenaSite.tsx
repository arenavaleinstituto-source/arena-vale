import React, { useState } from 'react';
import {
  Play,
  Calendar,
  Trophy,
  Users,
  HeartHandshake,
  Shield,
  Lock,
  Menu,
  X,
  ArrowUpRight,
  ArrowLeft,
  Check,
  Copy,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  MapPin,
  Clock,
  Tv,
  BookOpen,
  Building2,
} from 'lucide-react';
import { ArenaLogo } from './ArenaLogo';
import { OwnerPanel } from './OwnerPanel';
import {
  ARENA_CONSTANTS,
  CHAMPIONSHIPS_DATA,
  INITIAL_MATCHES,
  ATHLETES_DATA,
  NEWS_ARTICLES,
  ModalityKey,
  MatchScheduleItem,
  NewsArticle,
  buildWhatsAppLink,
} from '../data/arenaSiteData';

export type ArenaPageRoute =
  | 'home'
  | 'tv'
  | 'agenda'
  | 'atletas'
  | 'projetosocial'
  | 'painel';

interface RebuiltArenaSiteProps {
  topOffsetClass?: string;
}

export const RebuiltArenaSite: React.FC<RebuiltArenaSiteProps> = ({
  topOffsetClass = 'top-11',
}) => {
  const [activePage, setActivePage] = useState<ArenaPageRoute>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ---- Hidden owner panel: 5 taps on the footer logo ---- */
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [logoTaps, setLogoTaps] = useState(0);
  const logoTimer = React.useRef<number | null>(null);

  const handleSecretLogoTap = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (logoTimer.current) window.clearTimeout(logoTimer.current);
    logoTimer.current = window.setTimeout(() => setLogoTaps(0), 2600);
    if (next >= 5) {
      setLogoTaps(0);
      setOwnerOpen(true);
    }
  };
  const [selectedModality, setSelectedModality] = useState<ModalityKey>('Futsal');
  const [agendaFilter, setAgendaFilter] = useState<ModalityKey | 'Todas'>('Todas');
  const [athleteFilter, setAthleteFilter] = useState<ModalityKey | 'Todos'>('Todos');
  const [tvFilter, setTvFilter] = useState<'todos' | 'programas' | 'transmissoes'>('todos');

  // Dynamic Matches state (editable from Protected Coordinator Panel)
  const [matches, setMatches] = useState<MatchScheduleItem[]>(INITIAL_MATCHES);

  // News Modal & Legal Modal
  const [openNews, setOpenNews] = useState<NewsArticle | null>(null);
  const [legalModal, setLegalModal] = useState<'privacidade' | 'termos' | null>(null);

  // Cookie LGPD Banner
  const [cookieAccepted, setCookieAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('arena_lgpd_ok') === '1';
    } catch {
      return false;
    }
  });

  // Social Project Youth Registration Form
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentNeighborhood, setStudentNeighborhood] = useState('');
  const [studentSport, setStudentSport] = useState<ModalityKey>('Futsal');
  const [guardianName, setGuardianName] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  // Protected Admin Panel State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // New match form inside Admin Panel
  const [newTeamA, setNewTeamA] = useState('');
  const [newTeamB, setNewTeamB] = useState('');
  const [newDate, setNewDate] = useState('Dom · 31 Mai 2026');
  const [newTime, setNewTime] = useState('16:00');
  const [newModality, setNewModality] = useState<ModalityKey>('Futsal');
  const [newVenue, setNewVenue] = useState('Ginásio Central do Vale');

  const navigateToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (activePage !== 'home') {
      setActivePage('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToPage = (page: ArenaPageRoute, scrollToId?: string) => {
    setMobileMenuOpen(false);
    setActivePage(page);
    if (scrollToId) {
      setTimeout(() => {
        document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth' });
      }, 90);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(ARENA_CONSTANTS.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2400);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Olá, equipe Arena Vale! Gostaria de realizar a pré-inscrição gratuita no Projeto Social:\n\n• Jovem/Atleta: ${studentName}\n• Idade: ${studentAge} anos\n• Modalidade: ${studentSport}\n• Bairro/Comunidade: ${studentNeighborhood}\n• Responsável: ${guardianName}`;
    window.open(buildWhatsAppLink(msg), '_blank', 'noopener,noreferrer');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPass.trim().length >= 6) {
      setIsAdminAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciais inválidas. Utilize o acesso autorizado da coordenação.');
    }
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamA.trim() || !newTeamB.trim()) return;
    const created: MatchScheduleItem = {
      id: `m-${Date.now()}`,
      date: newDate,
      time: newTime,
      modality: newModality,
      category: 'Temporada Oficial 2026',
      teamA: newTeamA.trim(),
      teamB: newTeamB.trim(),
      venue: newVenue.trim() || 'Ginásio Parceiro do Vale',
      broadcast: true,
      stage: 'Nova Partida Confirmada',
    };
    setMatches((prev) => [created, ...prev]);
    setNewTeamA('');
    setNewTeamB('');
  };

  const acceptCookies = () => {
    setCookieAccepted(true);
    try {
      localStorage.setItem('arena_lgpd_ok', '1');
    } catch {
      // ignore
    }
  };

  const currentChamp = CHAMPIONSHIPS_DATA[selectedModality];

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col">
      {/* OFFICIAL ARENA VALE HEADER */}
      <header
        className={`sticky ${topOffsetClass} z-30 border-b border-white/[0.08] bg-[#07080c]/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <button
            type="button"
            onClick={() => navigateToPage('home')}
            className="cursor-pointer text-left"
          >
            <ArenaLogo size="md" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-black uppercase tracking-[0.13em] text-[#b8c0d4]">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className={`transition cursor-pointer ${
                activePage === 'home' ? 'text-white' : 'hover:text-[#e50914]'
              }`}
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('tv')}
              className={`inline-flex items-center gap-2 transition cursor-pointer ${
                activePage === 'tv' ? 'text-[#ff4b52]' : 'text-white hover:text-[#e50914]'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-pulse shadow-[0_0_8px_#e50914]" />
              TV Arena Vale
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('noticias')}
              className="hover:text-white transition cursor-pointer"
            >
              Notícias
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('agenda')}
              className={`transition cursor-pointer ${
                activePage === 'agenda' ? 'text-[#ff4b52]' : 'hover:text-white'
              }`}
            >
              Agenda
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('campeonatos')}
              className="hover:text-white transition cursor-pointer"
            >
              Campeonatos
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('atletas')}
              className={`transition cursor-pointer ${
                activePage === 'atletas' ? 'text-[#ff4b52]' : 'hover:text-white'
              }`}
            >
              Atletas Destaque
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('projetosocial')}
              className={`transition cursor-pointer ${
                activePage === 'projetosocial'
                  ? 'text-amber-400'
                  : 'text-amber-300/90 hover:text-amber-300'
              }`}
            >
              Projeto Social
            </button>
          </nav>

          {/* Desktop Right CTAs */}
          <div className="hidden xl:flex items-center gap-3">
            <a
              href={buildWhatsAppLink(
                'Olá! Gostaria de anunciar minha marca nas transmissões e campeonatos da Arena Vale.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-6 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-[#e50914]/30 transition hover:scale-105"
            >
              Anuncie
            </a>
            <button
              type="button"
              onClick={() => navigateToPage('painel')}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-black uppercase tracking-[0.13em] text-white transition hover:border-[#e50914] hover:bg-white/[0.08] cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5 text-[#e50914]" />
              Painel
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex xl:hidden items-center gap-2.5">
            <a
              href={buildWhatsAppLink(
                'Olá! Gostaria de anunciar minha marca na Arena Vale.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#e50914] px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30"
            >
              Anuncie
            </a>
            <button
              type="button"
              aria-label="Abrir Menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-white/10 bg-[#0a0c14] px-6 py-5 space-y-3 text-xs font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className="block w-full text-left py-2 text-white"
            >
              Início
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('tv')}
              className="block w-full text-left py-2 text-[#ff4b52]"
            >
              🔴 TV Arena Vale (Catálogo)
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('noticias')}
              className="block w-full text-left py-2 text-slate-300"
            >
              Notícias & Cobertura
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('agenda')}
              className="block w-full text-left py-2 text-slate-300"
            >
              Agenda de Jogos 2026
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('campeonatos')}
              className="block w-full text-left py-2 text-slate-300"
            >
              Campeonatos
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('atletas')}
              className="block w-full text-left py-2 text-slate-300"
            >
              Atletas em Destaque
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('projetosocial')}
              className="block w-full text-left py-2 text-amber-400"
            >
              ★ Projeto Social Arena Vale
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('painel')}
              className="block w-full text-left py-2 text-slate-400 border-t border-white/10 pt-3"
            >
              🔒 Painel do Coordenador
            </button>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* ROUTE 1: FULL HOME PAGE                                    */}
      {/* ========================================================= */}
      {activePage === 'home' && (
        <main className="flex-1">
          {/* HERO SECTION */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 sm:pt-8 pb-12">
            <div className="relative min-h-[500px] sm:min-h-[580px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 bg-[#11141d] shadow-[0_25px_70px_rgba(0,0,0,0.75)] flex flex-col justify-end p-6 sm:p-14">
              <img
                src="https://images.pexels.com/photos/6077792/pexels-photo-6077792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                alt="Arena Vale Cobertura Esportiva"
                className="absolute inset-0 h-full w-full object-cover object-center brightness-65 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07080c]/95 via-[#07080c]/50 to-transparent" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-3.5 py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" />
                  COBERTURA & TRANSMISSÃO OFICIAL NO VALE
                </div>

                <h1 className="mt-4 sm:mt-5 font-display text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[0.95]">
                  <span className="block">O PALCO DO</span>
                  <span className="block mt-1">
                    <span className="text-[#e50914]">ESPORTE</span> É AQUI.
                  </span>
                </h1>

                <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-lg text-[#cad0e0] leading-relaxed">
                  Transmissões ao vivo em alta definição, gestão de campeonatos, estatísticas de atletas e impacto comunitário através do nosso Projeto Social gratuito.
                </p>

                <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigateToPage('tv')}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-[#e50914]/30 transition hover:scale-105 cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" /> TRANSMISSÕES AO VIVO
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToSection('campeonatos')}
                    className="rounded-full border border-white/20 bg-white/5 px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-white backdrop-blur-md transition hover:bg-white/10 hover:border-white/40 cursor-pointer"
                  >
                    VER CAMPEONATOS →
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateToSection('projetosocial')}
                    className="rounded-full border border-amber-400/40 bg-amber-500/10 px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-amber-300 backdrop-blur-md transition hover:bg-amber-500/20 cursor-pointer"
                  >
                    PROJETO SOCIAL
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* TV ARENA VALE LIVE BROADCAST SECTION */}
          <section className="border-t border-white/5 bg-[#0b0d14] px-4 sm:px-6 py-16">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">
                    TV ARENA VALE · BROADCAST
                  </p>
                  <h2 className="mt-1 font-display text-4xl sm:text-5xl font-black italic uppercase tracking-tight text-white">
                    SINAL AO VIVO &{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">
                      TRANSMISSÕES
                    </span>
                  </h2>
                </div>
                <a
                  href={ARENA_CONSTANTS.youtubeChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/60 bg-[#e50914]/10 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[#e50914] transition shadow-lg shadow-[#e50914]/15"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Canal YouTube @TVArenaVale ↗
                </a>
              </div>

              {/* Clean 16:9 Embedded Player (Fixes the old static box & 140% crop bug) */}
              <div className="mx-auto max-w-4xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#e50914]/20 border border-[#e50914]/40 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#e50914] animate-ping" />
                    DESTAQUE TV ARENA VALE · TRANSMISSÃO OFICIAL
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Player integrado em Alta Definição
                  </span>
                </div>

                <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/15 bg-black shadow-2xl">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${ARENA_CONSTANTS.featuredYoutubeId}?rel=0&modestbranding=1`}
                    title="Transmissão Oficial TV Arena Vale"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="text-center pt-10 mt-10 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => navigateToPage('tv')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-white hover:bg-white/10 transition shadow-lg cursor-pointer"
                >
                  ACESSAR CATÁLOGO COMPLETO DA TV ARENA VALE ↗
                </button>
              </div>
            </div>
          </section>

          {/* PLATAFORMA & APLICATIVO ARENA VALE */}
          <section
            id="app"
            className="border-t border-white/5 bg-gradient-to-br from-[#12151f] via-[#0b0d14] to-[#07080c] px-4 sm:px-6 py-20 text-center"
          >
            <div className="mx-auto max-w-5xl flex flex-col items-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-4">
                ECOSSISTEMA DIGITAL · GESTÃO ESPORTIVA
              </span>
              <h2 className="font-display text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-white leading-none">
                PLATAFORMA & APP{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-[#e50914]">
                  ARENA VALE
                </span>
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl mx-auto">
                Tudo o que coordenadores, escolinhas e clubes precisam para gerir equipes, acompanhar campeonatos e solicitar arbitragem oficial na palma da mão.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={buildWhatsAppLink(
                    'Olá! Quero solicitar acesso à Plataforma / Aplicativo de Gestão da Arena Vale para minha equipe ou escolinha.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-8 py-4 text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-amber-500/20 hover:scale-105 transition"
                >
                  SOLICITAR ACESSO GESTOR ↗
                </a>
              </div>

              <div className="mt-14 grid gap-6 sm:grid-cols-3 w-full text-left">
                {[
                  {
                    title: 'GESTÃO DE EQUIPES',
                    desc: 'Sorteador equilibrado por estrelas, cronômetro oficial de partida, registro de gols, assistências e ranking anual.',
                    msg: 'Olá! Quero conhecer o módulo de Gestão de Equipes da Arena Vale.',
                  },
                  {
                    title: 'MENSALIDADES ESCOLINHA',
                    desc: 'Matrícula digital de alunos, controle de vencimentos e envio automático de lembretes aos pais com chave PIX.',
                    msg: 'Olá! Quero conhecer o sistema de Mensalidades para Escolinha da Arena Vale.',
                  },
                  {
                    title: 'SOLICITAR ARBITRAGEM',
                    desc: 'Escala completa com delegado, árbitro principal e auxiliares para jogos de Futsal, Futebol 7, Basquete e Vôlei.',
                    msg: 'Olá! Preciso solicitar orçamento de Equipe de Arbitragem da Arena Vale.',
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl transition hover:border-amber-400/50 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-base font-black uppercase tracking-wider text-white">
                        {card.title}
                      </h3>
                      <p className="mt-2.5 text-xs sm:text-sm text-[#9aa3b8] leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <a
                      href={buildWhatsAppLink(card.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-300 hover:text-amber-200"
                    >
                      Solicitar agora <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* NOTÍCIAS & COBERTURA (ARENA PRESS) */}
          <section
            id="noticias"
            className="mx-auto max-w-7xl px-4 sm:px-6 py-20 scroll-mt-24"
          >
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" />
                  <span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">
                    AGORA NA ARENA · IMPRENSA OFICIAL
                  </span>
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-black italic uppercase tracking-tight text-white leading-none">
                  CONTEÚDO &{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-[#ff4b52]">
                    COBERTURA
                  </span>
                </h2>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                TEMPORADA 2026
              </span>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {NEWS_ARTICLES.map((article) => (
                <article
                  key={article.id}
                  onClick={() => setOpenNews(article)}
                  className="group relative min-h-[420px] flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c0f17] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:-translate-y-2 hover:border-[#e50914]/70 cursor-pointer"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-center opacity-45 transition-all duration-700 group-hover:scale-110 group-hover:opacity-65"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/85 to-transparent" />

                  <div className="relative z-10 p-6 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-block -skew-x-12 bg-[#e50914] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        <span className="inline-block skew-x-12">{article.tag}</span>
                      </span>
                      <span className="inline-block -skew-x-12 border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#cad0e0]">
                        <span className="inline-block skew-x-12">{article.subTag}</span>
                      </span>
                    </div>
                    <span
                      className="font-display text-4xl font-black italic leading-none text-transparent select-none"
                      style={{ WebkitTextStroke: '1px rgba(255,255,255,0.28)' }}
                    >
                      {article.number}
                    </span>
                  </div>

                  <div className="relative z-10 p-6 pt-0 mt-auto">
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="h-1 w-8 bg-[#e50914] transition-all duration-300 group-hover:w-14" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914]">
                        ARENA PRESS
                      </span>
                    </div>
                    <h3 className="font-display text-3xl font-black italic uppercase leading-none text-white group-hover:text-[#ff4b52] transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-xs sm:text-sm text-[#b8c0d4] leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:text-[#e50914] transition">
                        LER MATÉRIA COMPLETA <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* AGENDA DE JOGOS PREVIEW (POPULATED!) */}
          <section className="border-t border-white/5 bg-[#0b0d14] px-4 sm:px-6 py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="h-3 w-1.5 bg-[#e50914] -skew-x-12" />
                    <span className="text-xs font-black tracking-[0.3em] text-[#e50914] uppercase">
                      CALENDÁRIO ESPORTIVO 2026
                    </span>
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl font-black italic uppercase tracking-tight text-white leading-none">
                    PRÓXIMOS <span className="text-[#e50914]">CONFRONTOS</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToPage('agenda')}
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer self-start"
                >
                  Ver Agenda Completa ({matches.length} Jogos) ↗
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {matches.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-white/10 bg-[#111522] p-5 flex flex-col justify-between shadow-xl hover:border-[#e50914]/50 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                        <span className="rounded-full bg-[#e50914]/20 border border-[#e50914]/40 px-2.5 py-0.5 text-[#ff4b52] uppercase font-black">
                          {m.modality}
                        </span>
                        {m.broadcast && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase">
                            <Tv className="h-3 w-3" /> Ao Vivo TV Arena
                          </span>
                        )}
                      </div>

                      <div className="mt-4 py-3 border-y border-white/10 text-center">
                        <p className="font-display text-2xl font-extrabold uppercase text-white">
                          {m.teamA}
                        </p>
                        <span className="my-1 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-black text-amber-400">
                          VS
                        </span>
                        <p className="font-display text-2xl font-extrabold uppercase text-white">
                          {m.teamB}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-xs text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-slate-200 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-[#e50914]" /> {m.date}
                        </span>
                        <span className="font-mono-code font-bold text-amber-300">
                          {m.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" /> {m.venue}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ATLETAS EM DESTAQUE CALLOUT */}
          <section className="bg-[#07080c] px-4 sm:px-6 py-14">
            <div className="mx-auto max-w-7xl">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#11141d] shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/15818644/pexels-photo-15818644.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                  alt="Atletas em Destaque Arena Vale"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center brightness-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/80 to-transparent sm:bg-gradient-to-r sm:from-[#07080c]/95 sm:via-[#07080c]/75 sm:to-transparent" />
                <div className="relative z-10 flex min-h-[340px] flex-col justify-end p-8 sm:max-w-2xl sm:p-14">
                  <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#e50914]/20 border border-[#e50914]/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#ff4b52]">
                    PROTAGONISTAS DA QUADRA
                  </span>
                  <h3 className="mt-4 font-display text-4xl sm:text-6xl font-black uppercase leading-none text-white">
                    CONHEÇA TODOS OS <br />
                    <span className="text-[#e50914]">ATLETAS EM DESTAQUE</span>
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-[#cad0e0] leading-relaxed">
                    Os talentos, artilheiros, cestinhas e MVPs que transformam cada rodada em um grande espetáculo esportivo no Vale.
                  </p>
                  <div className="mt-7">
                    <button
                      type="button"
                      onClick={() => navigateToPage('atletas')}
                      className="rounded-full bg-[#e50914] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 transition hover:bg-[#ff1e27] hover:scale-105 cursor-pointer"
                    >
                      ABRIR GALERIA DE ATLETAS →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CAMPEONATOS DA TEMPORADA 2026 (INTERACTIVE TABS) */}
          <section
            id="campeonatos"
            className="mx-auto max-w-7xl px-4 sm:px-6 py-16 scroll-mt-24"
          >
            <div className="mb-8">
              <p className="text-xs font-black tracking-[0.25em] text-[#e50914] uppercase">
                COMPETIÇÕES OFICIAIS
              </p>
              <h2 className="mt-1 font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
                CAMPEONATOS DA TEMPORADA 2026
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {(Object.keys(CHAMPIONSHIPS_DATA) as ModalityKey[]).map((mod) => {
                const active = selectedModality === mod;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setSelectedModality(mod)}
                    className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      active
                        ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                        : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                    }`}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-[#11141d] p-6 sm:p-12 shadow-2xl">
              <div className="grid gap-8 lg:grid-cols-12 items-center pb-8 border-b border-white/10">
                <div className="lg:col-span-4">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-white/15 shadow-xl">
                    <img
                      src={currentChamp.image}
                      alt={currentChamp.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-[#e50914] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                      {currentChamp.modality}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/35 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#ff4b52]">
                      {currentChamp.badge}
                    </span>
                    <h3 className="mt-3 font-display text-3xl sm:text-4xl font-black uppercase text-white">
                      {currentChamp.title}
                    </h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-amber-400">
                      {currentChamp.status}
                    </p>
                    <p className="mt-3 text-sm text-[#cad0e0] leading-relaxed">
                      {currentChamp.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <a
                      href={buildWhatsAppLink(
                        `Olá! Quero inscrever minha equipe no ${currentChamp.title} (${currentChamp.modality}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e50914] to-[#ff1e27] px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e50914]/30 hover:scale-105 transition"
                    >
                      Inscrever Equipe em {currentChamp.modality} ↗
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Categorias', val: currentChamp.categories },
                  { label: 'Formato de Disputa', val: currentChamp.format },
                  { label: 'Duração da Partida', val: currentChamp.duration },
                  { label: 'Locais dos Jogos', val: currentChamp.venue },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                  >
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#e50914] mb-1">
                      {spec.label}
                    </span>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {spec.val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Partners Row with Vector Institutional Emblem */}
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-xs font-black uppercase tracking-widest text-[#8a92a6] mb-5">
                  PARCERIAS & COTAS DE APOIO DA COMPETIÇÃO
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/35 bg-emerald-500/[0.07] p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 font-display text-lg font-black text-emerald-300">
                      AC
                    </div>
                    <div>
                      <span className="block text-sm font-black uppercase tracking-wider text-white">
                        ACADESF
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        Parceiro Institucional Oficial
                      </span>
                    </div>
                  </div>

                  <a
                    href={buildWhatsAppLink(
                      `Olá! Tenho interesse na Cota Master do ${currentChamp.title}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-400/35 bg-[#07080c]/60 p-5 text-center hover:border-amber-400 transition"
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Cota Master do Torneio
                    </span>
                    <span className="text-[11px] font-bold text-amber-300 mt-1">
                      Disponível para Captação ↗
                    </span>
                  </a>

                  <a
                    href={buildWhatsAppLink(
                      `Olá! Tenho interesse na Cota Apoio Regional do ${currentChamp.title}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-[#07080c]/60 p-5 text-center hover:border-[#e50914] transition"
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Apoio Regional
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 mt-1">
                      Disponível para Captação ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* POR QUE PATROCINAR (FIXED %2520 WHATSAPP ENCODING!) */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-[#12151f] via-[#0d1017] to-[#07080c] p-8 sm:p-16 shadow-[0_25px_80px_rgba(0,0,0,0.8)]">
              <div className="relative z-10 max-w-4xl mx-auto text-center mb-14">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-amber-300 mb-4">
                  OPORTUNIDADE COMERCIAL EXCLUSIVA
                </span>
                <h2 className="font-display text-4xl sm:text-6xl font-black italic uppercase tracking-tight text-white leading-none">
                  POR QUE PATROCINAR A{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-[#e50914]">
                    ARENA VALE
                  </span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-3xl mx-auto">
                  Conecte sua marca a um público engajado e apaixonado por esporte em toda a região do Vale. Visibilidade garantida em transmissões ao vivo em alta definição, placares eletrônicos, redes sociais e arenas parceiras o ano inteiro.
                </p>
              </div>

              <div className="relative z-10 grid gap-8 lg:grid-cols-3 mb-12">
                {/* Cota Master */}
                <div className="flex flex-col justify-between rounded-3xl border border-amber-400/60 bg-gradient-to-b from-amber-500/15 via-[#0c0f17] to-[#07080c] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-400 text-black text-[10px] font-black uppercase px-4 py-1 rounded-bl-2xl tracking-wider">
                    DESTAQUE
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-black uppercase text-white tracking-wide mb-1">
                      Cota Master
                    </h3>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-5">
                      Exposição Principal em TV e Quadra
                    </p>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#cad0e0] mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span> Logo em destaque na abertura e intervalo de todas as transmissões
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span> Presença fixa no placar eletrônico durante os jogos ao vivo
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span> Backdrop oficial de quadra/campo em toda a temporada
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">✓</span> Menção oficial nas redes sociais a cada rodada
                      </li>
                    </ul>
                  </div>
                  <a
                    href={buildWhatsAppLink(
                      'Olá, tenho interesse na Cota Master de patrocínio da Arena Vale!'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center rounded-full bg-amber-400 py-3.5 text-xs font-black uppercase tracking-widest text-black hover:bg-amber-300 transition shadow-lg shadow-amber-500/20"
                  >
                    Garantir Cota Master ↗
                  </a>
                </div>

                {/* Cota Apoio Regional */}
                <div className="flex flex-col justify-between rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.05] via-[#0c0f17] to-[#07080c] p-8 shadow-2xl">
                  <div>
                    <h3 className="font-display text-3xl font-black uppercase text-white tracking-wide mb-1">
                      Cota Apoio Regional
                    </h3>
                    <p className="text-xs font-bold text-[#e50914] uppercase tracking-widest mb-5">
                      Cota de Transmissão Ao Vivo
                    </p>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#cad0e0] mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-[#e50914] font-bold">✓</span> Inserção periódica da marca durante as transmissões ao vivo
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#e50914] font-bold">✓</span> Menção comercial na abertura e encerramento das partidas
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#e50914] font-bold">✓</span> Presença oficial na vitrine de parceiros do site
                      </li>
                    </ul>
                  </div>
                  <a
                    href={buildWhatsAppLink(
                      'Olá, tenho interesse na Cota Apoio Regional da Arena Vale!'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center rounded-full border border-white/20 bg-white/5 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition"
                  >
                    Garantir Apoio Regional ↗
                  </a>
                </div>

                {/* Cota Institucional */}
                <div className="flex flex-col justify-between rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-[#0c0f17] to-[#07080c] p-8 shadow-2xl">
                  <div>
                    <h3 className="font-display text-3xl font-black uppercase text-white tracking-wide mb-1">
                      Cota Institucional
                    </h3>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-5">
                      Parceiros de Incentivo ao Esporte
                    </p>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#cad0e0] mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span> Associação oficial ao Projeto Social Arena Vale (+1.200 jovens)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span> Marca fixa na seção institucional do portal
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">✓</span> Certificado de Empresa Amiga do Esporte Comunitário
                      </li>
                    </ul>
                  </div>
                  <a
                    href={buildWhatsAppLink(
                      'Olá, tenho interesse na Cota Institucional e apoio ao Projeto Social da Arena Vale!'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center rounded-full border border-emerald-500/40 bg-emerald-500/15 py-3.5 text-xs font-black uppercase tracking-widest text-emerald-300 hover:bg-emerald-500 hover:text-black transition"
                  >
                    Garantir Cota Institucional ↗
                  </a>
                </div>
              </div>

              <div className="relative z-10 pt-8 border-t border-white/10 text-center">
                <a
                  href={buildWhatsAppLink(
                    'Olá! Gostaria de receber o Mídia Kit 2026 com valores atualizados de patrocínio da Arena Vale.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:scale-105 transition shadow-lg shadow-emerald-600/30"
                >
                  💬 Falar com Comercial no WhatsApp: {ARENA_CONSTANTS.whatsappDisplay} ↗
                </a>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* REBUILT & CONNECTED #PROJETOSOCIAL SECTION ON HOME        */}
          {/* ========================================================= */}
          <section
            id="projetosocial"
            className="border-t border-white/5 bg-[#0b0d14] px-4 sm:px-6 py-20 scroll-mt-24"
          >
            <div className="mx-auto max-w-7xl">
              <div className="rounded-[2.5rem] border border-amber-400/25 bg-gradient-to-br from-[#161a26] via-[#101420] to-[#080a11] p-6 sm:p-12 lg:p-14 shadow-2xl overflow-hidden relative">
                <div className="grid gap-10 lg:grid-cols-12 items-center">
                  <div className="lg:col-span-7 space-y-5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                      <HeartHandshake className="h-3.5 w-3.5" /> IMPACTO SOCIAL & INCLUSÃO NO VALE
                    </span>

                    <h2 className="font-display text-4xl sm:text-6xl font-black uppercase leading-[0.96] text-white">
                      PROJETO SOCIAL <br />
                      <span className="text-[#e50914]">ARENA VALE</span>
                    </h2>

                    <p className="text-sm sm:text-base text-[#cad0e0] leading-relaxed max-w-2xl">
                      O esporte como ferramenta real de transformação comunitária. Há duas décadas oferecendo treinos 100% gratuitos, acompanhamento escolar, disciplina e inclusão social para crianças e adolescentes em mais de 15 comunidades do Vale.
                    </p>

                    {/* 4 Impact Metrics surfaced directly on Home */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {[
                        { num: '+1.200', label: 'Jovens Beneficiados' },
                        { num: '20 Anos', label: 'De Dedicação' },
                        { num: '15+', label: 'Comunidades' },
                        { num: '100%', label: 'Gratuito p/ Alunos' },
                      ].map((kpi) => (
                        <div
                          key={kpi.label}
                          className="rounded-2xl border border-white/10 bg-black/35 p-4 text-center"
                        >
                          <span className="block font-display text-2xl sm:text-3xl font-black text-amber-400">
                            {kpi.num}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                            {kpi.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Connected CTAs: Full Page + Student Registration + Sponsor WhatsApp */}
                    <div className="pt-3 flex flex-wrap items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => navigateToPage('projetosocial')}
                        className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-7 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e50914]/30 hover:bg-[#ff1e27] hover:scale-105 transition cursor-pointer"
                      >
                        Conhecer Projeto Completo & Fotos <ArrowUpRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateToPage('projetosocial', 'inscricao-jovem')}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-400/45 bg-amber-400/10 px-6 py-4 text-xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-400/20 transition cursor-pointer"
                      >
                        <Users className="h-4 w-4" /> Inscrever Criança / Jovem
                      </button>

                      <a
                        href={buildWhatsAppLink(
                          'Olá! Gostaria de saber como minha empresa ou família pode apoiar o Projeto Social da Arena Vale.'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-4 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition"
                      >
                        💼 Apoiar via WhatsApp ↗
                      </a>
                    </div>
                  </div>

                  {/* Authentic Community Youth Sports Photo Collage */}
                  <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
                    <div className="col-span-2 overflow-hidden rounded-3xl border border-white/15 aspect-[16/10] relative">
                      <img
                        src="https://images.pexels.com/photos/8941609/pexels-photo-8941609.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                        alt="Treino comunitário de jovens do Projeto Social Arena Vale"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 text-[11px] font-bold text-white">
                        Formação esportiva e cidadã gratuita no Vale
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-white/15 aspect-[4/3]">
                      <img
                        src="https://images.pexels.com/photos/28260827/pexels-photo-28260827.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                        alt="Inclusão feminina no esporte comunitário"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-white/15 aspect-[4/3]">
                      <img
                        src="https://images.pexels.com/photos/8941613/pexels-photo-8941613.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                        alt="Orientação educacional e esportiva para crianças"
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================= */}
      {/* ROUTE 2: FULL DEDICATED /PROJETOSOCIAL PAGE               */}
      {/* ========================================================= */}
      {activePage === 'projetosocial' && (
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-16 space-y-16 flex-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Início
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('campeonatos')}
              className="text-xs font-black uppercase tracking-wider text-amber-300 hover:underline cursor-pointer"
            >
              Ver Campeonatos Oficiais →
            </button>
          </div>

          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
              COMPROMISSO COMUNITÁRIO · ARENA VALE
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
              Transformando Vidas Através do{' '}
              <span className="text-[#e50914]">Esporte</span>
            </h1>
            <p className="text-sm sm:text-base text-[#9aa3b8] leading-relaxed">
              Acreditamos que o esporte é a ferramenta mais poderosa de inclusão social, formação de caráter, permanência escolar e criação de oportunidades reais para o futuro da juventude da nossa região.
            </p>
          </div>

          {/* 4 Impact Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: '+1.200', l: 'Jovens Beneficiados' },
              { v: '20 Anos', l: 'De Histórico e Dedicação' },
              { v: '15+', l: 'Comunidades Atendidas' },
              { v: '100%', l: 'Gratuito para Atletas do Projeto' },
            ].map((kpi) => (
              <div
                key={kpi.l}
                className="rounded-2xl border border-white/10 bg-[#11141d] p-6 text-center shadow-xl"
              >
                <div className="font-display text-3xl sm:text-5xl font-black text-amber-400">
                  {kpi.v}
                </div>
                <div className="text-xs font-bold text-[#b8c0d4] uppercase tracking-wider mt-2">
                  {kpi.l}
                </div>
              </div>
            ))}
          </div>

          {/* 3 Pillars */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-3xl sm:text-4xl font-black uppercase text-white">
                Os Nossos Pilares de Atuação
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Como estruturamos nosso impacto contínuo nos bairros e polos esportivos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Trophy,
                  title: 'Inclusão Através do Esporte',
                  desc: 'Garantimos acesso 100% gratuito a treinos orientados, materiais esportivos e participação em campeonatos para crianças e jovens.',
                  img: 'https://images.pexels.com/photos/7611541/pexels-photo-7611541.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                },
                {
                  icon: BookOpen,
                  title: 'Educação e Cidadania',
                  desc: 'Aliamos a prática esportiva ao acompanhamento de frequência escolar, valores de convivência comunitária, disciplina e respeito.',
                  img: 'https://images.pexels.com/photos/10347891/pexels-photo-10347891.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                },
                {
                  icon: Building2,
                  title: 'Infraestrutura Comunitária',
                  desc: 'Apoio à revitalização de quadras, campos comunitários e espaços públicos para a prática segura de futsal, futebol, vôlei e atletismo.',
                  img: 'https://images.pexels.com/photos/8941569/pexels-photo-8941569.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
                },
              ].map((pilar) => {
                const Icon = pilar.icon;
                return (
                  <div
                    key={pilar.title}
                    className="rounded-3xl border border-white/15 bg-[#11141d] overflow-hidden shadow-xl flex flex-col"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={pilar.img}
                        alt={pilar.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-7 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e50914]/15 border border-[#e50914]/35 text-[#ff4b52] mb-4">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-black uppercase text-white mb-2">
                          {pilar.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {pilar.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TWO ACTION FLOWS: 1) FAMILY REGISTRATION  2) SPONSOR/PIX TRANSPARENCY */}
          <div
            id="inscricao-jovem"
            className="grid gap-8 lg:grid-cols-12 scroll-mt-28"
          >
            {/* Left: Youth Registration Form */}
            <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-[#111522] p-6 sm:p-8 shadow-2xl">
              <span className="inline-block rounded-full bg-amber-400/15 border border-amber-400/35 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-3">
                PARA PAIS E RESPONSÁVEIS · VAGAS GRATUITAS
              </span>
              <h3 className="font-display text-3xl font-black uppercase text-white">
                Pré-Inscrição de Criança ou Adolescente
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Preencha os dados abaixo para encaminhar o pedido de matrícula gratuita diretamente à coordenação do polo mais próximo via WhatsApp.
              </p>

              <form onSubmit={handleStudentSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Nome Completo do Jovem / Atleta
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Ex.: Pedro Henrique Souza"
                    className="w-full rounded-xl border border-white/15 bg-[#070910] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={21}
                    required
                    value={studentAge}
                    onChange={(e) => setStudentAge(e.target.value)}
                    placeholder="Ex.: 12"
                    className="w-full rounded-xl border border-white/15 bg-[#070910] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Modalidade de Interesse
                  </label>
                  <select
                    value={studentSport}
                    onChange={(e) => setStudentSport(e.target.value as ModalityKey)}
                    className="w-full rounded-xl border border-white/15 bg-[#070910] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  >
                    <option value="Futsal">Futsal</option>
                    <option value="Futebol 7">Futebol de Campo / Society</option>
                    <option value="Basquetebol">Basquetebol</option>
                    <option value="Voleibol">Voleibol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Bairro / Comunidade / Cidade
                  </label>
                  <input
                    type="text"
                    required
                    value={studentNeighborhood}
                    onChange={(e) => setStudentNeighborhood(e.target.value)}
                    placeholder="Ex.: Bairro Velha / Blumenau"
                    className="w-full rounded-xl border border-white/15 bg-[#070910] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Nome do Pai / Mãe / Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Nome do responsável legal"
                    className="w-full rounded-xl border border-white/15 bg-[#070910] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-[#e50914] to-[#ff2530] py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[#e50914]/30 hover:scale-[1.01] transition cursor-pointer"
                  >
                    Enviar Pré-Inscrição Gratuita via WhatsApp ↗
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Corporate Support & PIX CNPJ Transparency */}
            <div className="lg:col-span-5 rounded-3xl border border-emerald-500/35 bg-gradient-to-b from-[#111c1a] via-[#0d111a] to-[#080a11] p-6 sm:p-8 shadow-2xl flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <span className="inline-block rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  TRANSPARÊNCIA & APOIO DIRETO
                </span>
                <h3 className="font-display text-3xl font-black uppercase text-white">
                  Apoie como Empresa ou Padrinho Social
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Toda contribuição ajuda a financiar bolas, coletes, uniformes, taxas de arbitragem e lanches para jovens em vulnerabilidade social atendidos pelo projeto.
                </p>

                <div className="rounded-2xl border border-white/10 bg-black/45 p-4 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase text-slate-400">
                    Chave PIX Oficial (CNPJ Arena Vale)
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5">
                    <span className="font-mono-code text-sm font-bold text-emerald-300">
                      {ARENA_CONSTANTS.pixKey}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copiar PIX
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Razão Registrada · CNPJ {ARENA_CONSTANTS.cnpj}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={buildWhatsAppLink(
                    'Olá! Gostaria de apoiar institucionalmente o Projeto Social da Arena Vale e conhecer as contrapartidas para empresas.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center rounded-full bg-emerald-500 py-3.5 text-xs font-black uppercase tracking-widest text-black hover:bg-emerald-400 transition shadow-lg"
                >
                  Quero Ser Empresa Apoiadora ↗
                </a>
                <button
                  type="button"
                  onClick={() => navigateToPage('home')}
                  className="block w-full text-center rounded-full border border-white/15 bg-white/5 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Conhecer Cotas de Transmissão
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* ROUTE 3: TV ARENA VALE CATALOG (/TV)                       */}
      {/* ========================================================= */}
      {activePage === 'tv' && (
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-16 space-y-10 flex-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Início
            </button>
            <a
              href={ARENA_CONSTANTS.youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black uppercase tracking-wider text-[#ff4b52] hover:underline"
            >
              Inscrever-se no YouTube @TVArenaVale ↗
            </a>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-4">
              <span className="h-2 w-2 rounded-full bg-[#e50914] animate-ping" />
              SINAL ABERTO · BROADCAST HD
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-black italic uppercase text-white">
              CATÁLOGO <span className="text-[#e50914]">TV ARENA VALE</span>
            </h1>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { id: 'todos', label: 'TODOS OS CONTEÚDOS' },
              { id: 'programas', label: 'RESENHAS & BASTIDORES' },
              { id: 'transmissoes', label: 'JOGOS NA ÍNTEGRA' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setTvFilter(tab.id as 'todos' | 'programas' | 'transmissoes')
                }
                className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  tvFilter === tab.id
                    ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                    : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {(tvFilter === 'todos' || tvFilter === 'programas') && (
              <div className="rounded-2xl border border-white/10 bg-[#0c0f17] overflow-hidden shadow-2xl flex flex-col">
                <div className="relative aspect-video w-full bg-black">
                  {/* Fixed clean w-full h-full without the 140% crop bug */}
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${ARENA_CONSTANTS.featuredYoutubeId}?rel=0&modestbranding=1`}
                    title="Resenha da Arbitragem · TV Arena Vale"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#e50914]">
                      PROGRAMA OFICIAL
                    </span>
                    <h3 className="mt-1 text-lg font-black uppercase text-white">
                      Resenha da Arbitragem · TV Arena Vale
                    </h3>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${ARENA_CONSTANTS.featuredYoutubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-[#e50914] transition"
                  >
                    YouTube ↗
                  </a>
                </div>
              </div>
            )}

            {(tvFilter === 'todos' || tvFilter === 'transmissoes') && (
              <div className="rounded-2xl border border-white/10 bg-[#0c0f17] overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/29388472/pexels-photo-29388472.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                    alt="Próxima Transmissão Circuito Futsal"
                    className="h-full w-full object-cover brightness-65"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col items-center justify-center p-6 text-center">
                    <span className="rounded-full bg-[#e50914] px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-3">
                      PRÓXIMA LIVE AGENDADA
                    </span>
                    <h4 className="font-display text-3xl font-black uppercase text-white">
                      Abertura Circuito Futsal 2026
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Ative o sininho no canal oficial @TVArenaVale para ser avisado no apito inicial
                    </p>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      COBERTURA AO VIVO
                    </span>
                    <h3 className="mt-1 text-lg font-black uppercase text-white">
                      Grade Completa no Canal do YouTube
                    </h3>
                  </div>
                  <a
                    href={ARENA_CONSTANTS.youtubeChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full bg-[#e50914] px-4 py-2 text-xs font-bold text-white hover:bg-[#ff1e27] transition"
                  >
                    Acessar Canal ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* ROUTE 4: AGENDA COMPLETA (/AGENDA)                         */}
      {/* ========================================================= */}
      {activePage === 'agenda' && (
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-16 space-y-10 flex-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Início
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('painel')}
              className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Gerenciar Jogos no Painel →
            </button>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-[#e50914]/50 bg-[#e50914]/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-3">
              CALENDÁRIO OFICIAL 2026
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-black italic uppercase text-white">
              AGENDA COMPLETA DE <span className="text-[#e50914]">JOGOS</span>
            </h1>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {(['Todas', 'Futsal', 'Futebol 7', 'Basquetebol', 'Voleibol'] as const).map(
              (mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setAgendaFilter(mod)}
                  className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    agendaFilter === mod
                      ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                      : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                  }`}
                >
                  {mod}
                </button>
              )
            )}
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {matches
              .filter((m) => agendaFilter === 'Todas' || m.modality === agendaFilter)
              .map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-[#11141d] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#e50914] px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                        {m.modality}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {m.category} · {m.stage}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white pt-1">
                      {m.teamA}{' '}
                      <span className="text-amber-400 mx-1.5 text-xl">VS</span>{' '}
                      {m.teamB}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#e50914]" /> {m.venue}
                      </span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="block text-xs font-bold text-white">
                        {m.date}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono-code text-sm font-bold text-amber-300">
                        <Clock className="h-3.5 w-3.5" /> {m.time}
                      </span>
                    </div>
                    {m.broadcast && (
                      <button
                        type="button"
                        onClick={() => navigateToPage('tv')}
                        className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                      >
                        ▶ Transmissão TV Arena
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* ROUTE 5: ATLETAS EM DESTAQUE (/ATLETAS)                    */}
      {/* ========================================================= */}
      {activePage === 'atletas' && (
        <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 py-12 sm:py-16 space-y-10 flex-1">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateToPage('home')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao Início
            </button>
          </div>

          <div className="border-b border-white/10 pb-8">
            <span className="inline-block rounded-full bg-[#e50914]/15 border border-[#e50914]/30 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4b52] mb-3">
              GALERIA OFICIAL · TEMPORADA 2026
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-black uppercase text-white">
              Atletas em Destaque
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Os talentos, artilheiros, cestinhas e protagonistas das competições oficiais do ecossistema Arena Vale.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(['Todos', 'Futsal', 'Basquetebol', 'Futebol 7', 'Voleibol'] as const).map(
              (mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setAthleteFilter(mod)}
                  className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                    athleteFilter === mod
                      ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/30'
                      : 'border border-white/15 bg-white/5 text-[#cad0e0] hover:text-white'
                  }`}
                >
                  {mod}
                </button>
              )
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ATHLETES_DATA.filter(
              (a) => athleteFilter === 'Todos' || a.modality === athleteFilter
            ).map((atl) => (
              <div
                key={atl.id}
                className="group relative rounded-[2rem] border border-white/10 bg-[#11141d] p-6 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-[#e50914]/60 hover:-translate-y-1.5 min-h-[370px]"
              >
                <img
                  src={atl.image}
                  alt={atl.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-40 group-hover:scale-105 group-hover:opacity-55 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#0d1018]/85 to-transparent" />

                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-[#e50914] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-4">
                    {atl.modality}
                  </span>
                </div>

                <div className="relative z-10 mt-auto">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                    {atl.award}
                  </p>
                  <h3 className="font-display text-3xl font-black uppercase text-white leading-none mt-1">
                    {atl.name}
                  </h3>
                  <p className="text-xs text-[#cad0e0] mt-1">{atl.teamAndRole}</p>

                  <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-black/50 border border-white/5 p-2.5">
                      <span className="block text-sm font-black text-white">
                        {atl.matches}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Jogos
                      </span>
                    </div>
                    <div className="rounded-xl bg-black/50 border border-white/5 p-2.5">
                      <span className="block text-sm font-black text-[#ff4b52]">
                        {atl.scoreLabel}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Marca
                      </span>
                    </div>
                    <div className="rounded-xl bg-black/50 border border-white/5 p-2.5">
                      <span className="block text-sm font-black text-white">
                        {atl.assistsLabel}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Destaque
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ========================================================= */}
      {/* ROUTE 6: PROTECTED COORDINATOR PANEL (/PAINEL)             */}
      {/* ========================================================= */}
      {activePage === 'painel' && (
        <main className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-12 sm:py-16 flex-1 flex flex-col justify-center">
          {!isAdminAuthenticated ? (
            <div className="max-w-md w-full mx-auto rounded-3xl border border-white/15 bg-[#0d111e] p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e50914]/15 border border-[#e50914]/40 text-[#ff4b52]">
                  <Shield className="h-6 w-6" />
                </div>
                <h1 className="font-display text-3xl font-black uppercase text-white">
                  Centro de Comando Protegido
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Diferente do site antigo na Vercel, esta área exige autenticação antes de exibir dados internos.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="coordenacao@arenavalesports.com.br"
                    className="w-full rounded-xl border border-white/15 bg-[#070910] p-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Senha de Acesso
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/15 bg-[#070910] p-3 text-sm text-white focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-red-400 font-semibold">{loginError}</p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#e50914] py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#ff1e27] transition cursor-pointer"
                >
                  Autenticar no Painel
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-white/10 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('coordenacao@arenavalesports.com.br');
                    setLoginPass('arena2026');
                    setIsAdminAuthenticated(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Entrar em Modo Demonstração (Testar Gestão de Agenda)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-[#0f1524] p-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    SESSÃO AUTENTICADA · GESTÃO RÁPIDA
                  </span>
                  <h1 className="font-display text-3xl font-black uppercase text-white">
                    Gestor de Confrontos da Agenda 2026
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigateToPage('agenda')}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
                  >
                    Ver na Agenda Pública ↗
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="rounded-full bg-red-500/20 border border-red-500/40 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-500/30 cursor-pointer"
                  >
                    Encerrar Sessão
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleAddMatch}
                className="rounded-3xl border border-white/10 bg-[#0d101b] p-6 grid gap-4 sm:grid-cols-3"
              >
                <div className="sm:col-span-3">
                  <h2 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Cadastrar Novo Jogo na Agenda
                  </h2>
                </div>
                <input
                  type="text"
                  required
                  value={newTeamA}
                  onChange={(e) => setNewTeamA(e.target.value)}
                  placeholder="Equipe Mandante (Ex.: Blumenau Futsal)"
                  className="rounded-xl border border-white/15 bg-[#070910] px-3.5 py-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={newTeamB}
                  onChange={(e) => setNewTeamB(e.target.value)}
                  placeholder="Equipe Visitante (Ex.: Gaspar EC)"
                  className="rounded-xl border border-white/15 bg-[#070910] px-3.5 py-2.5 text-xs text-white"
                />
                <select
                  value={newModality}
                  onChange={(e) => setNewModality(e.target.value as ModalityKey)}
                  className="rounded-xl border border-white/15 bg-[#070910] px-3.5 py-2.5 text-xs text-white"
                >
                  <option value="Futsal">Futsal</option>
                  <option value="Futebol 7">Futebol 7</option>
                  <option value="Basquetebol">Basquetebol</option>
                  <option value="Voleibol">Voleibol</option>
                </select>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="Data (Ex.: Dom · 31 Mai 2026)"
                  className="rounded-xl border border-white/15 bg-[#070910] px-3.5 py-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="Horário (Ex.: 19:30)"
                  className="rounded-xl border border-white/15 bg-[#070910] px-3.5 py-2.5 text-xs text-white"
                />
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="Ginásio / Local da Partida"
                  className="sm:col-span-2 rounded-xl border border-white/15 bg-[#070910] px-3.5 py-2.5 text-xs text-white"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#e50914] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[#ff1e27] transition cursor-pointer"
                >
                  Publicar Jogo na Agenda
                </button>
              </form>

              <div className="space-y-2.5">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b0e17] px-4 py-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#ff4b52] mr-2">[{m.modality}]</span>
                      <strong className="text-white">
                        {m.teamA} vs {m.teamB}
                      </strong>
                      <span className="text-slate-400 ml-2">
                        ({m.date} às {m.time} · {m.venue})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setMatches((prev) => prev.filter((item) => item.id !== m.id))
                      }
                      className="text-slate-400 hover:text-red-400 p-1 cursor-pointer"
                      title="Remover partida"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ========================================================= */}
      {/* UNIFIED OFFICIAL FOOTER (ZERO **CFG6** LEAKS!)             */}
      {/* ========================================================= */}
      <footer className="border-t border-white/10 bg-[#050609] px-6 py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center text-center">
          {/* Secret trigger: 5 taps on the logo opens the Owner Panel */}
          <button
            type="button"
            onClick={handleSecretLogoTap}
            title="Arena Vale Sports"
            className="relative cursor-pointer rounded-2xl outline-none transition active:scale-[0.98]"
          >
            {logoTaps > 0 && logoTaps < 5 && (
              <span
                className="pointer-events-none absolute -inset-2 rounded-3xl border border-amber-400/50"
                style={{ animation: 'tapPulse 0.5s ease-out' }}
              />
            )}
            <ArenaLogo size="lg" />
            {logoTaps > 0 && logoTaps < 5 && (
              <span className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono-code text-[10px] text-amber-400/80">
                {logoTaps}/5
              </span>
            )}
          </button>

          {/* Official Active Social Channels (Instagram + YouTube + WhatsApp) */}
          <div className="flex items-center justify-center gap-4 mt-7 mb-6">
            <a
              href={ARENA_CONSTANTS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Oficial @arenavaleoficial"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-[#cad0e0] transition hover:border-[#e50914] hover:bg-[#e50914] hover:text-white"
            >
              Instagram
            </a>
            <a
              href={ARENA_CONSTANTS.youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Canal YouTube @TVArenaVale"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-[#cad0e0] transition hover:border-[#e50914] hover:bg-[#e50914] hover:text-white"
            >
              YouTube TV
            </a>
            <a
              href={buildWhatsAppLink('Olá, equipe Arena Vale! Vim pelo site oficial.')}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp Oficial"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-[#cad0e0] transition hover:border-emerald-500 hover:bg-emerald-600 hover:text-white"
            >
              WhatsApp {ARENA_CONSTANTS.whatsappDisplay}
            </a>
          </div>

          <p className="text-sm font-semibold text-[#8a92a6]">
            {ARENA_CONSTANTS.slogan}
          </p>
          <p className="text-xs text-[#646e82] mt-1 font-mono-code">
            CNPJ: {ARENA_CONSTANTS.cnpj}
          </p>

          <div className="pt-8 mt-8 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-[#646e82]">
            <span>
              © 2026 Arena Vale Sports · Mídia Esportiva, Eventos & Projeto Social. Todos os direitos reservados.
            </span>
            <span className="hidden sm:inline">|</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setLegalModal('privacidade')}
                className="hover:text-white transition underline underline-offset-4 decoration-white/20 cursor-pointer"
              >
                Política de Privacidade (LGPD)
              </button>
              <button
                type="button"
                onClick={() => setLegalModal('termos')}
                className="hover:text-white transition underline underline-offset-4 decoration-white/20 cursor-pointer"
              >
                Termos de Uso
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* NEWS ARTICLE FULL READER MODAL */}
      {openNews && (
        <div
          onClick={() => setOpenNews(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full rounded-3xl border border-white/15 bg-[#0e121f] overflow-hidden shadow-2xl"
          >
            <div className="relative h-56 w-full">
              <img
                src={openNews.image}
                alt={openNews.title}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setOpenNews(null)}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-[#e50914] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <span className="rounded-full bg-[#e50914]/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#ff4b52]">
                {openNews.tag} · {openNews.subTag}
              </span>
              <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-white">
                {openNews.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {openNews.fullText}
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const dest = openNews.targetPage;
                    setOpenNews(null);
                    if (dest === 'campeonatos') navigateToSection('campeonatos');
                    else navigateToPage(dest);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#ff1e27] transition cursor-pointer"
                >
                  {openNews.ctaLabel} <ArrowUpRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpenNews(null)}
                  className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL MODAL (PRIVACIDADE / TERMOS) */}
      {legalModal && (
        <div
          onClick={() => setLegalModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full rounded-3xl border border-white/15 bg-[#0e121f] p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-black uppercase text-white">
                {legalModal === 'privacidade'
                  ? 'Política de Privacidade & Proteção de Dados (LGPD)'
                  : 'Termos e Condições de Uso'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {legalModal === 'privacidade' ? (
                <>
                  <p>
                    A <strong>Arena Vale Sports</strong> (CNPJ {ARENA_CONSTANTS.cnpj}), em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), coleta apenas informações estritamente necessárias para atendimento de inscrições esportivas, matrículas gratuitas no Projeto Social (com consentimento expresso dos pais ou responsáveis legais) e propostas comerciais.
                  </p>
                  <p>
                    As transmissões incorporadas utilizam o modo de privacidade aprimorada (<code className="font-mono-code">youtube-nocookie.com</code>), evitando rastreamento publicitário indevido sem interação do usuário.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Todo o conteúdo audiovisual, transmissões ao vivo da TV Arena Vale, tabelas de competições e marcas parceiras pertencem à <strong>Arena Vale Sports</strong> (CNPJ {ARENA_CONSTANTS.cnpj}) e às entidades organizadoras conveniadas.
                  </p>
                  <p>
                    A participação das equipes nos campeonatos da temporada 2026 segue regulamento técnico específico entregue no Congresso Técnico de cada modalidade.
                  </p>
                </>
              )}
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="rounded-full bg-[#e50914] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN OWNER PANEL — abre com 5 toques na logomarca do rodapé */}
      {ownerOpen && <OwnerPanel onClose={() => setOwnerOpen(false)} />}

      <style>{`
        @keyframes tapPulse {
          0% { opacity: 0; transform: scale(0.94); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.35; transform: scale(1); }
        }
      `}</style>

      {/* COMPACT LGPD COOKIE CONSENT BAR */}
      {!cookieAccepted && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#0d111d]/95 p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-300 text-center sm:text-left">
            Utilizamos cookies essenciais e player em modo de privacidade aprimorada conforme a{' '}
            <button
              type="button"
              onClick={() => setLegalModal('privacidade')}
              className="underline text-amber-300 cursor-pointer"
            >
              LGPD
            </button>
            .
          </p>
          <button
            type="button"
            onClick={acceptCookies}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-emerald-400 transition cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Aceitar e Continuar
          </button>
        </div>
      )}
    </div>
  );
};
