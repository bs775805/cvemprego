// src/app/empresa/vagas/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Star, Loader2, Trash2 } from "lucide-react";

// Interface para remover o "any"
interface VagaDaEmpresa {
  id: string;
  title: string;
  contractType: string;
  island: string;
  status: string;
  isFeatured: boolean;
  _count: { applications: number };
}

const traducaoContrato: Record<string, string> = { PERMANENT: "Efectivo", TEMPORARY: "Temporário", INTERNSHIP: "Estágio" };
const traducaoIlha: Record<string, string> = { SANTIAGO: "Santiago", SAO_VICENTE: "São Vicente", SAL: "Sal", BOA_VISTA: "Boa Vista", FOGO: "Fogo", SANTO_ANTAO: "Santo Antão", SAO_NICOLAU: "São Nicolau", BRAVA: "Brava", MAIO: "Maio" };

export default function AsMinhasVagasPage() {
  // Estado já com o tipo correto
  const [vagas, setVagas] = useState<VagaDaEmpresa[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarVagas = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/empresa/minhas-vagas");
      const json = await res.json();
      if (json.success) setVagas(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarVagas(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tens a certeza que queres apagar esta vaga? Todas as candidaturas serão perdidas!")) return;
    
    try {
      const res = await fetch(`/api/empresa/vagas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVagas(vagas.filter(v => v.id !== id));
      } else {
        alert("Erro ao apagar a vaga.");
      }
    } catch {
      alert("Falha na ligação.");
    }
  };

  return (
    <div className="max-w-6xl font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">As minhas vagas</h1>
        <Link href="/empresa/vagas/nova" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Publicar vaga
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Título</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Ilha</th>
              <th className="px-6 py-4 text-center">Candidatos</th>
              <th className="px-6 py-4 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></td></tr>
            ) : vagas.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Ainda não publicaste nenhuma vaga.</td></tr>
            ) : (
              vagas.map((vaga) => (
                <tr key={vaga.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{vaga.title}</span>
                      {vaga.isFeatured && (
                        <span className="bg-amber-50 text-amber-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400" /> Destaque
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{traducaoContrato[vaga.contractType] || "N/A"}</td>
                  <td className="px-6 py-4 text-slate-600">{traducaoIlha[vaga.island] || "N/A"}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-900">{vaga._count?.applications || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link href={`/empresa/candidatos?jobId=${vaga.id}`} className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100">
                        Candidatos
                      </Link>
                      <Link href={`/empresa/vagas/${vaga.id}/editar`} className="px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-blue-600 hover:bg-blue-50 border-blue-200">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(vaga.id)} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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