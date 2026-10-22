import React from 'react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-4 font-sans text-center">
      <h1 className="text-6xl font-black text-amber-400 tracking-widest mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6">Página Não Encontrada</h2>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        O conteúdo que procura não existe ou foi movido. Verifique o endereço ou regresse à página principal da Arena Vale.
      </p>
      {/* Utilizando âncora padrão <a> para evitar o ReferenceError do Link */}
      <a 
        href="/" 
        className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-[#070b13] font-bold rounded-lg text-sm transition"
      >
        VOLTAR AO INÍCIO
      </a>
    </main>
  );
}
