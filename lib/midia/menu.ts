/** Menu principal do site (spec Fase 3, seção 4). */
export const MENU_PRINCIPAL: { rotulo: string; href: string; vivo?: boolean }[] = [
  { rotulo: 'Início', href: '/' },
  { rotulo: 'Ao Vivo', href: '/ao-vivo', vivo: true },
  { rotulo: 'Notícias do Vale', href: '/noticias' },
  { rotulo: 'Esporte Mundial', href: '/noticias?aba=mundo' },
  { rotulo: 'Agenda', href: '/agenda' },
  { rotulo: 'Modalidades', href: '/modalidades' },
  { rotulo: 'Projeto Social', href: '/projetosocial' },
  { rotulo: 'Atletas Destaques', href: '/atletasdestaques' },
];

/** Opções do botão "Entrar". O rótulo é só visual: o destino vem do cargo no banco. */
export const CARGOS_ENTRAR = ['Coordenação', 'Moderador', 'Capitão'] as const;

/** Rotas da equipe têm o próprio cabeçalho: o cabeçalho e o rodapé públicos não aparecem nelas. */
export const ROTAS_DA_EQUIPE = ['/painel', '/coordenador', '/proprietario', '/moderador', '/capitao'];

export function ehRotaDaEquipe(pathname: string): boolean {
  return ROTAS_DA_EQUIPE.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}
