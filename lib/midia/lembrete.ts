import type { ItemAgenda } from './agenda';

const DURACAO_MS = 2 * 3600 * 1000;

/** Data em UTC no formato do iCalendar: AAAAMMDDTHHMMSSZ. */
function emUtc(t: number): string {
  return new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escape de texto do iCalendar (RFC 5545, 3.3.11). */
function escapar(texto: string): string {
  return texto.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function titulo(item: ItemAgenda): string {
  return `${item.casa} x ${item.fora} — ARENA VALE`;
}

function descricao(item: ItemAgenda, baseUrl: string): string {
  const partes = [item.modalidade, item.fase].filter(Boolean).join(' · ');
  return `${partes ? partes + '. ' : ''}Assista ao vivo: ${baseUrl}/ao-vivo`;
}

function periodo(item: ItemAgenda): { inicio: string; fim: string } {
  const t = Date.parse(item.dataHora);
  return { inicio: emUtc(t), fim: emUtc(t + DURACAO_MS) };
}

/** Arquivo .ics do jogo, com aviso 30 min antes. */
export function gerarIcs(item: ItemAgenda, baseUrl: string): string {
  const { inicio, fim } = periodo(item);
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ARENA VALE//Agenda//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${item.origem}-${item.id}@arenavale.com.br`,
    `DTSTAMP:${emUtc(Date.now())}`,
    `DTSTART:${inicio}`,
    `DTEND:${fim}`,
    `SUMMARY:${escapar(titulo(item))}`,
    `DESCRIPTION:${escapar(descricao(item, baseUrl))}`,
    ...(item.local ? [`LOCATION:${escapar(item.local)}`] : []),
    `URL:${baseUrl}/ao-vivo`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapar(titulo(item))}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return linhas.join('\r\n') + '\r\n';
}

/** Link "adicionar ao Google Agenda". */
export function linkGoogleAgenda(item: ItemAgenda, baseUrl: string): string {
  const { inicio, fim } = periodo(item);
  const q = new URLSearchParams({
    text: titulo(item),
    dates: `${inicio}/${fim}`,
    details: descricao(item, baseUrl),
  });
  if (item.local) q.set('location', item.local);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${q.toString().replace(/\+/g, '%20')}`;
}
