// src/app/candidato/definicoes/page.tsx
"use client";

export default function DefinicoesPage() {
  return (
    <div className="max-w-2xl font-sans">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Definições</h1>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-6">Notificações por Email</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Nova vaga na minha área</span>
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Mudança de estado na candidatura</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Newsletter semanal</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </label>
          </div>
        </div>

        <div className="p-8 border-b border-slate-100 space-y-6">
          <h2 className="text-sm font-bold text-slate-900">Alterar Password</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Password actual</label>
              <input type="password" title="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nova password</label>
              <input type="password" title="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md">
            Guardar
          </button>
        </div>

        <div className="p-8 bg-slate-50/50">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
            Eliminar conta
          </button>
        </div>
      </div>
    </div>
  );
}