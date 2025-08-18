
import React, { useState } from 'react';
import GeradorBombom from '../components/GeradorBombom';

export default function CustomizadorBombom() {
  const [form, setForm] = useState({
    corCasquinha: 'Vermelho',
    tipoChocolate: 'Chocolate ao Leite Belga',
    base: 'base crocante de chocolate com sucrilhos',
    ganache: 'ganache de morango',
    geleia: 'geléia de morango',
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Customizador de Bombom (Teste)</h1>

      <label className="block">
        <span className="text-sm">Cor da casquinha</span>
        <input
          className="border rounded p-2 w-full"
          value={form.corCasquinha}
          onChange={(e) => setForm((f) => ({ ...f, corCasquinha: e.target.value }))}
        />
      </label>

      <label className="block">
        <span className="text-sm">Tipo de chocolate</span>
        <input
          className="border rounded p-2 w-full"
          value={form.tipoChocolate}
          onChange={(e) => setForm((f) => ({ ...f, tipoChocolate: e.target.value }))}
        />
      </label>

      <label className="block">
        <span className="text-sm">Base</span>
        <input
          className="border rounded p-2 w-full"
          value={form.base}
          onChange={(e) => setForm((f) => ({ ...f, base: e.target.value }))}
        />
      </label>

      <label className="block">
        <span className="text-sm">Ganache</span>
        <input
          className="border rounded p-2 w-full"
          value={form.ganache}
          onChange={(e) => setForm((f) => ({ ...f, ganache: e.target.value }))}
        />
      </label>

      <label className="block">
        <span className="text-sm">Geléia (ou “Sem geléia”)</span>
        <input
          className="border rounded p-2 w-full"
          value={form.geleia}
          onChange={(e) => setForm((f) => ({ ...f, geleia: e.target.value }))}
        />
      </label>

      <GeradorBombom selecao={form} />
    </div>
  );
}
