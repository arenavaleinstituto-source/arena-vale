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

/** Prefixos para onde um `next` pode levar depois do login (só a área da equipe). */
const PREFIXOS_EQUIPE = ['/coordenador', '/painel', '/moderador', '/capitao', '/proprietario'];
const BASE_FALSA = 'https://arena-vale.invalid';

/**
 * Normaliza um destino interno vindo de URL (`next`). Recusa qualquer coisa que
 * o navegador possa transformar em outro site: barras invertidas, caracteres de
 * controle (inclusive codificados), protocolo, `//host`.
 */
function caminhoInterno(next: string | null | undefined, origem?: string): string | null {
  if (typeof next !== 'string' || next === '') return null;
  let bruto = next;
  if (origem && bruto.startsWith(origem)) bruto = bruto.slice(origem.length) || '/';
  let decodificado: string;
  try {
    decodificado = decodeURIComponent(bruto);
  } catch {
    return null;
  }
  for (const v of [bruto, decodificado]) {
    if (!v.startsWith('/') || v.startsWith('//') || v.includes('\\') || /[\u0000-\u001f\u007f]/.test(v)) return null;
  }
  const url = new URL(bruto, BASE_FALSA);
  if (url.origin !== BASE_FALSA) return null;
  return url.pathname + url.search;
}

const dentroDaEquipe = (caminho: string) => PREFIXOS_EQUIPE.some((p) => dentroDe(caminho.split('?')[0], p));

/**
 * Para onde mandar a pessoa depois do login. `next` só vale se for um caminho
 * da área da equipe que o cargo pode abrir. Sem cargo de equipe → `null`.
 */
export function destinoPorCargo(cargo: Cargo, next?: string | null, ehDono = false): string | null {
  const padrao = PAINEL[cargo] ?? null;
  if (!padrao) return null;
  const caminho = caminhoInterno(next);
  if (caminho && dentroDaEquipe(caminho) && decidirRota(caminho.split('?')[0], cargo, ehDono) === 'livre') return caminho;
  return padrao;
}

/** Destino depois de confirmar um link de e-mail (convite, link de acesso, nova senha). */
export function destinoConfirmacao(next: string | null | undefined, origem?: string): string {
  const caminho = caminhoInterno(next, origem);
  if (caminho && (dentroDe(caminho.split('?')[0], '/criar-senha') || dentroDaEquipe(caminho))) return caminho;
  return '/login';
}

/** Endereço do login que volta para a mesma página (com a busca, ex.: `?aba=noticias&editar=…`). */
export function enderecoDeLogin(pathname: string, search: string): string {
  return `/login?next=${encodeURIComponent(pathname + (search || ''))}`;
}
