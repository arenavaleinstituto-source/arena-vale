'use client';

import { useState } from 'react';
import Link from 'next/link';

export function PortalMenu() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="btn-outline"
        aria-expanded={aberto}
      >
        ☰ Portal
      </button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0c1f4a] p-2 shadow-2xl">
          <Link
            href="/coordenador"
            onClick={() => setAberto(false)}
            className="block rounded-lg px-4 py-3 text-sm hover:bg-white/10"
          >
            🔐 Coordenador
          </Link>

          <Link
            href="/moderador"
            onClick={() => setAberto(false)}
            className="block rounded-lg px-4 py-3 text-sm hover:bg-white/10"
          >
            🛡️ Moderador
          </Link>

          <Link
            href="/capitao"
            onClick={() => setAberto(false)}
            className="block rounded-lg px-4 py-3 text-sm hover:bg-white/10"
          >
            👑 Capitão
          </Link>
        </div>
      )}
    </div>
  );
}

