const FUSO = 'America/Sao_Paulo';

/** "Sáb 15/11 · 16h" ou "Qui 20/11 · 12h30", no horário de Brasília. */
export function formatarQuando(iso: string): string {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
  const p = (t: string) => partes.find((x) => x.type === t)?.value ?? '';
  const dia = p('weekday').replace('.', '');
  const semana = dia.charAt(0).toUpperCase() + dia.slice(1, 3);
  const min = p('minute');
  return `${semana} ${p('day')}/${p('month')} · ${p('hour')}h${min === '00' ? '' : min}`;
}

/** "30/08" no horário de Brasília. */
export function formatarDiaMes(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit' }).format(new Date(iso));
}
