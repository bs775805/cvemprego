// src/app/admin/vagas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface VagaAdmin {
  id: string;
  title: string;
  status: string;
  company: { name: string };
  _count?: { applications: number }; // Tornamos opcional para segurança
}

export default function AdminVagasPage() {
  const [vagas, setVagas] = useState<VagaAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarVagas = async () => {
    try {
      const res = await fetch("/api/vagas");
      const json = await res.json();
      if (json.success) {
        setVagas(json.data);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarVagas(); }, []);

  const apagarVaga = async (id: string) => {
    if (!confirm("Confirmas a eliminação permanente desta vaga?")) return;
    
    try {
      const res = await fetch(`/api/admin/vagas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVagas(vagas.filter(v => v.id !== id));
      } else {
        alert("Erro ao apagar. Apenas Admins podem fazer isto.");
      }
    } catch {
      alert("Falha na ligação ao servidor.");
    }
  };

  return (
    <div className="max-w-6xl font-sans">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Moderação de Vagas</h1>

      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
            <tr>
              <th className="px-6 py-4 text-white uppercase font-black">Vaga / Empresa</th>
              <th className="px-6 py-4 uppercase font-black">Candidatos</th>
              <th className="px-6 py-4 uppercase font-black">Estado</th>
              <th className="px-6 py-4 text-right uppercase font-black">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600 w-8 h-8" /></td></tr>
            ) : vagas.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-slate-500 font-medium">Não foram encontradas vagas no sistema.</td></tr>
            ) : (
              vagas.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{v.title}</p>
                    <p className="text-xs text-slate-400 font-medium">{v.company.name}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-600">
                    {/* 👇 CORREÇÃO: Uso de optional chaining para evitar o erro fatal */}
                    {v._count?.applications ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 rounded-md text-slate-500 border border-slate-200">
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/vagas/${v.id}`} target="_blank" className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => apagarVaga(v.id)} 
                        className="p-2 border border-slate-200 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}