'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MODALIDADES_SITE, type Modalidade } from './modalidades';

/** Avisado pela tela de Modalidades quando a lista muda. */
export const EVENTO_MODALIDADES = 'arena-modalidades-mudou';

/** Lista de modalidades para os formulários do painel (inclui as escondidas, para não perder o valor já gravado). */
export function useModalidades(): Modalidade[] {
  const [lista, setLista] = useState<Modalidade[]>(MODALIDADES_SITE);
  useEffect(() => {
    let vivo = true;
    const carregar = async () => {
      try {
        const { data, error } = await createClient().from('modalidades').select('slug,nome,frase').order('ordem');
        if (vivo && !error && data?.length) setLista(data as Modalidade[]);
      } catch {
        /* fica com as 4 de sempre */
      }
    };
    void carregar();
    window.addEventListener(EVENTO_MODALIDADES, carregar);
    return () => {
      vivo = false;
      window.removeEventListener(EVENTO_MODALIDADES, carregar);
    };
  }, []);
  return lista;
}
