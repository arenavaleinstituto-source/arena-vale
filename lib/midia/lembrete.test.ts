import { describe, expect, it } from 'vitest';
import type { ItemAgenda } from './agenda';
import { gerarIcs, linkGoogleAgenda } from './lembrete';

const ITEM: ItemAgenda = {
  id: 'abc-123',
  origem: 'agenda',
  modalidade: 'Futsal',
  fase: 'Final',
  casa: 'São José, B; C',
  fora: 'Vila\\Nova',
  dataHora: '2026-11-15T22:30:00.000Z',
  local: 'Arena Vale',
  transmissao: true,
};
const BASE = 'https://www.arenavale.com.br';

describe('gerarIcs', () => {
  const ics = gerarIcs(ITEM, BASE);

  it('tem calendário e evento', () => {
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('escapa vírgula, ponto e vírgula e barra no título', () => {
    expect(ics).toContain('SUMMARY:São José\\, B\\; C x Vila\\\\Nova — ARENA VALE');
  });

  it('início e fim em UTC com 2 h de duração', () => {
    expect(ics).toContain('DTSTART:20261115T223000Z');
    expect(ics).toContain('DTEND:20261116T003000Z');
  });

  it('alarme 30 min antes', () => {
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('TRIGGER:-PT30M');
    expect(ics).toContain('ACTION:DISPLAY');
  });

  it('descrição com o link do ao vivo', () => {
    expect(ics).toMatch(/DESCRIPTION:.*https:\/\/www\.arenavale\.com\.br\/ao-vivo/);
  });

  it('linhas separadas por CRLF', () => {
    expect(ics.split('\r\n').length).toBeGreaterThan(10);
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('UID por origem e id', () => {
    expect(ics).toContain('UID:agenda-abc-123@arenavale.com.br');
  });
});

describe('linkGoogleAgenda', () => {
  const link = linkGoogleAgenda(ITEM, BASE);
  it('abre o modelo do Google Agenda com datas e título', () => {
    expect(link.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE')).toBe(true);
    const u = new URL(link);
    expect(u.searchParams.get('dates')).toBe('20261115T223000Z/20261116T003000Z');
    expect(u.searchParams.get('text')).toBe('São José, B; C x Vila\\Nova — ARENA VALE');
    expect(link).toContain('text=S%C3%A3o');
  });
});
