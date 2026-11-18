/**
 * Menu principal do site. Itens com `soNoHamburguer` ficam fora da barra do topo e aparecem
 * só no menu ☰. O "Ao Vivo" não está aqui: fica ao lado da logo, sempre visível.
 */
export const MENU_PRINCIPAL: { rotulo: string; href: string; soNoHamburguer?: boolean }[] = [
  { rotulo: 'Início', href: '/' },
  { rotulo: 'Campeonatos', href: '/campeonatos' },
  { rotulo: 'Notícias', href: '/noticias' },
  { rotulo: 'Agenda', href: '/agenda' },
  { rotulo: 'Modalidades', href: '/modalidades' },
  { rotulo: 'Projeto Social', href: '/projetosocial' },
  { rotulo: 'Atletas Destaques', href: '/atletasdestaques', soNoHamburguer: true },
  { rotulo: 'Galeria', href: '/galeria', soNoHamburguer: true },
];

/** Opções do botão "Entrar". O rótulo é só visual: o destino vem do cargo no banco. */
export const CARGOS_ENTRAR = ['Coordenação', 'Moderador', 'Capitão'] as const;

/** Rotas da equipe têm o próprio cabeçalho: o cabeçalho e o rodapé públicos não aparecem nelas. */
export const ROTAS_DA_EQUIPE = ['/painel', '/coordenador', '/proprietario', '/moderador', '/capitao'];

export function ehRotaDaEquipe(pathname: string): boolean {
  return ROTAS_DA_EQUIPE.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}
