/** Cargo como o site enxerga (o dono aparece como coordenador; `ehDono` é à parte). */
export type Cargo = 'visitante' | 'autenticado' | 'coordenador' | 'moderador' | 'capitao';
export type DecisaoRota = 'livre' | 'login' | 'negado' | 'nao-encontrado';

type Regra = { prefixo: string; permite: Cargo[] };

/** Áreas da equipe e quem entra em cada uma (spec 5.5). `/proprietario` é tratado à parte. */
const REGRAS: Regra[] = [
  { prefixo: '/coordenador', permite: ['coordenador'] },
  { prefixo: '/painel', permite: ['coordenador'] },
  { prefixo: '/moderador', permite: ['moderador', 'coordenador'] },
  { prefixo: '/capitao', permite: ['capitao', 'coordenador'] },
];

const PAINEL: Partial<Record<Cargo, string>> = {
  coordenador: '/coordenador',
  moderador: '/moderador',
  capitao: '/capitao',
};

function dentroDe(pathname: string, prefixo: string) {
  return pathname === prefixo || pathname.startsWith(`${prefixo}/`);
}

/** Converte `profiles.role` (ou ausência de usuário) no cargo do site. */
export function cargoDoBanco(role: string | null | undefined): Cargo {
  if (!role) return 'visitante';
  if (role === 'coordenador' || role === 'proprietario') return 'coordenador';
  if (role === 'moderador' || role === 'capitao') return role;
  return 'autenticado';
}

/** Quem pode abrir cada rota. Para quem não é o dono, `/proprietario` "não existe". */
export function decidirRota(pathname: string, cargo: Cargo, ehDono: boolean): DecisaoRota {
  if (dentroDe(pathname, '/proprietario')) return ehDono ? 'livre' : 'nao-encontrado';
  const regra = REGRAS.find((r) => dentroDe(pathname, r.prefixo));
  if (!regra) return 'livre';
  if (cargo === 'visitante') return 'login';
  return regra.permite.includes(cargo) ? 'livre' : 'negado';
}

/**
 * Para onde mandar a pessoa depois do login. `next` só vale se for um caminho
 * interno que o cargo pode abrir. Sem cargo de equipe → `null`.
 */
export function destinoPorCargo(cargo: Cargo, next?: string | null, ehDono = false): string | null {
  const padrao = PAINEL[cargo] ?? null;
  if (!padrao) return null;
  const interno = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//');
  if (interno && decidirRota(next, cargo, ehDono) === 'livre') return next;
  return padrao;
}
