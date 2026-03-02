// src/app/admin/empresas/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, BadgeCheck, XCircle, Search, ExternalLink, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface EmpresaAdmin {
  id: string;
  name: string;
  island: string;
  sector: string;
  isVerified: boolean;
  user: { email: string };
  logoUrl: string | null;
  _count: { jobListings: number };
}

export default function AdminCompaniesPage() {
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const carregarEmpresas = async () => {
    try {
      const res = await fetch("/api/admin/empresas");
      const json = await res.json();
      if (json.success) setEmpresas(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarEmpresas(); }, []);

  const toggleVerify = async (id: string) => {
    const res = await fetch(`/api/admin/empresas/${id}/toggle-verify`, { method: 'PATCH' });
    if (res.ok) {
      setEmpresas(empresas.map(e => e.id === id ? { ...e, isVerified: !e.isVerified } : e));
    }
  };

  const filtradas = empresas.filter(e => e.name.toLowerCase().includes(busca.toLowerCase()));

  const R2_URL = "https://pub-cc443c3ffe6e43e581c3431029871225.r2.dev";

  return (
    <div className="max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Empresas</h1>
          <p className="text-sm text-slate-500">Valida e monitoriza as organizações registadas</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por nome..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Empresa / Logo</th>
              <th className="px-8 py-5">Ilha / Sector</th>
              <th className="px-8 py-5 text-center">Vagas</th>
              <th className="px-8 py-5 text-center">Estado</th>
              <th className="px-8 py-5 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
            ) : filtradas.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400">Nenhuma empresa encontrada.</td></tr>
            ) : (
              filtradas.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl relative overflow-hidden border border-blue-100 flex items-center justify-center">
                        {emp.logoUrl ? (
                          <Image src={`${R2_URL}/${emp.logoUrl}`} alt="Logo" fill className="object-cover" unoptimized />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{emp.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{emp.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-semibold text-slate-700">{emp.island}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.sector}</p>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-slate-900">{emp._count.jobListings}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      emp.isVerified ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}>
                      {emp.isVerified && <BadgeCheck className="w-3 h-3" />}
                      {emp.isVerified ? "Verificada" : "Não validada"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleVerify(emp.id)}
                        className={`p-2 rounded-xl border transition-all ${
                          emp.isVerified 
                          ? "border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600" 
                          : "border-blue-100 text-blue-400 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                        title={emp.isVerified ? "Remover Verificação" : "Verificar Empresa"}
                      >
                        {emp.isVerified ? <XCircle className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />}
                      </button>
                      <Link href={`/empresas/${emp.id}`} target="_blank" className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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