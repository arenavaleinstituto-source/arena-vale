import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const chamadas: { tabela: string; op: string; valor: unknown }[] = [];
const dados: Record<string, unknown[]> = { campeonatos: [], site_config: [{ id: 'main', ao_vivo_manual: false, ao_vivo_link: null }] };

function consulta(tabela: string) {
  const resultado = () => Promise.resolve({ data: dados[tabela] ?? [], error: null });
  const q: Record<string, unknown> = {
    select: () => q,
    eq: () => q,
    order: () => q,
    maybeSingle: () => Promise.resolve({ data: (dados[tabela] ?? [])[0] ?? null, error: null }),
    then: (ok: (v: unknown) => unknown, erro: (e: unknown) => unknown) => resultado().then(ok, erro),
    insert: (v: unknown) => {
      chamadas.push({ tabela, op: 'insert', valor: v });
      return { select: () => ({ single: () => Promise.resolve({ data: { id: 'novo', ...(v as object) }, error: null }) }) };
    },
    update: (v: unknown) => {
      chamadas.push({ tabela, op: 'update', valor: v });
      return { eq: () => Promise.resolve({ error: null }) };
    },
    upsert: (v: unknown) => {
      chamadas.push({ tabela, op: 'upsert', valor: v });
      return Promise.resolve({ error: null });
    },
  };
  return q;
}
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ from: consulta }) }));

import { AbaAoVivo } from './AbaAoVivo';
import { CoordCampeonatos } from '../coord-campeonatos';

describe('AbaAoVivo', () => {
  beforeEach(() => {
    chamadas.length = 0;
  });

  it('mostra o estado da detecção automática', () => {
    render(<AbaAoVivo aoVivoDetectado={false} />);
    expect(screen.getByText(/Detecção automática/).textContent).toContain('Detecção automática: fora do ar');
  });

  it('"Estamos ao vivo agora" exige link https', async () => {
    render(<AbaAoVivo aoVivoDetectado={false} />);
    const u = userEvent.setup();
    await u.click(await screen.findByRole('checkbox', { name: 'Estamos ao vivo agora' }));
    await u.type(screen.getByLabelText('Link da transmissão'), 'youtube.com/live');
    await u.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(await screen.findByText('Cole o link da live começando com https://')).toBeInTheDocument();
    expect(chamadas).toEqual([]);
  });

  it('salva o ao vivo manual', async () => {
    render(<AbaAoVivo aoVivoDetectado={false} />);
    const u = userEvent.setup();
    await u.click(await screen.findByRole('checkbox', { name: 'Estamos ao vivo agora' }));
    await u.type(screen.getByLabelText('Link da transmissão'), 'https://youtu.be/abc');
    await u.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => expect(chamadas[0]).toEqual({ tabela: 'site_config', op: 'upsert', valor: expect.objectContaining({ id: 'main', ao_vivo_manual: true, ao_vivo_link: 'https://youtu.be/abc' }) }));
  });
});

describe('CoordCampeonatos', () => {
  beforeEach(() => {
    chamadas.length = 0;
  });

  it('modalidade tem as 4 opções e "—"', async () => {
    render(<CoordCampeonatos />);
    const select = await screen.findByLabelText('Modalidade');
    expect(Array.from((select as HTMLSelectElement).options).map((o) => o.textContent)).toEqual(['—', 'Futsal', 'Futebol 7', 'Basquete', 'Vôlei']);
  });

  it('cria campeonato com a modalidade escolhida', async () => {
    render(<CoordCampeonatos />);
    const u = userEvent.setup();
    await u.type(await screen.findByLabelText('Nome do campeonato'), 'Copa Futsal 2027');
    await u.selectOptions(screen.getByLabelText('Modalidade'), 'futsal');
    await u.click(screen.getByRole('button', { name: 'Criar campeonato' }));
    await waitFor(() => expect(chamadas[0]).toMatchObject({ tabela: 'campeonatos', op: 'insert', valor: expect.objectContaining({ nome: 'Copa Futsal 2027', modalidade: 'futsal' }) }));
  });

  it('nome vazio não cria', async () => {
    render(<CoordCampeonatos />);
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Criar campeonato' }));
    expect(await screen.findByText('Informe o nome do campeonato.')).toBeInTheDocument();
    expect(chamadas).toEqual([]);
  });
});
