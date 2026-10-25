'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // <-- GARANTA QUE ESTÁ IMPORTADO
import { createClient } from '@/lib/supabase/client';

// ... interfaces e dados padrão ...

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#e50914] selection:text-white flex flex-col justify-between font-sans overflow-x-hidden">
      
      {/* RENDERIZAÇÃO DO CABEÇALHO NOVO COM O MENU HIERÁRQUICO CFG6 */}
      <Header />

      {/* RESTANTE CONTEÚDO DA PÁGINA INICIAL */}
      <main className="mx-auto max-w-7xl w-full px-6 py-10 space-y-12">
        {/* ... secções da home ... */}
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-white/10 bg-[#050609] py-8 text-center text-xs text-[#555d6e]">
        © 2026 Arena Vale · Configuração CFG6. Todos os direitos reservados.
      </footer>
    </div>
  );
}
