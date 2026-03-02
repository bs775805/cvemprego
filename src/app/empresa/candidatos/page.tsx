// src/app/empresa/candidatos/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Loader2, ChevronDown } from "lucide-react";
import Link from "next/link";

// --- 1. Interfaces para o TypeScript (Segurança de Dados) ---
interface VagaDropdown {
  id: string;
  title: string;
  _count: { applications: number };
}

interface CandidatoInfo {
  firstName: string;
  lastName: string;
  user: { email: string };
  island: string;
  cvUrl: string | null;
}

interface Candidatura {
  id: string;
  status: string;
  appliedAt: string;
  coverMessage: string | null;
  candidate: CandidatoInfo & { id: string };
  job: { title: string; id: string };
}

// --- 2. Componente Interno (Lógica Principal) ---
function GestaoCandidatosContent() {
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");

  const [vagas, setVagas] = useState<VagaDropdown[]>([]);
  const [candidatos, setCandidatos] = useState<Candidatura[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // A. Carregar as vagas da empresa para o menu superior
  useEffect(() => {
    fetch("/api/empresa/minhas-vagas")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setVagas(json.data);
          if (jobIdFromUrl) {
            setSelectedJobId(jobIdFromUrl);
          }
        }
      });
  }, [jobIdFromUrl]);

  // B. Carregar os candidatos da vaga selecionada
  const carregarCandidatos = useCallback(async () => {
    if (selectedJobId === "all") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/empresa/vagas/${selectedJobId}/candidatos`);
      const json = await res.json();
      if (json.success) {
        setCandidatos(json.data);
      }
    } catch {
      console.error("Erro ao carregar candidatos");
    } finally {
      setLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    carregarCandidatos();
  }, [selectedJobId, carregarCandidatos]);

  // C. Função para mudar o estado da candidatura (PATCH)
  const mudarStatus = async (appId: string, status: string) => {
    try {
      const res = await fetch("/api/empresa/candidaturas/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, newStatus: status }),
      });
      if (res.ok) {
        carregarCandidatos();
      }
    } catch {
      alert("Erro ao atualizar o estado.");
    }
  };

  // D. Função para abrir o CV real do R2 (Signed URL)
  const visualizarCV = async (cvKey: string | null) => {
    if (!cvKey) {
      alert("Este candidato ainda não anexou um currículo.");
      return;
    }
    try {
      const res = await fetch(`/api/candidaturas/ver-cv?key=${cvKey}`);
      const json = await res.json();
      if (json.success) {
        window.open(json.url, "_blank");
      } else {
        alert("Erro ao gerar link do currículo.");
      }
    } catch {
      alert("Falha na ligação ao servidor.");
    }
  };

  // E. Lógica de Filtro das Tabs
  const candidatosFiltrados = candidatos.filter(c => 
    activeTab === "ALL" ? true : c.status === activeTab
  );

  const counts = {
    ALL: candidatos.length,
    PENDING: candidatos.filter(c => c.status === "PENDING").length,
    REVIEWING: candidatos.filter(c => c.status === "REVIEWING").length,
    SHORTLISTED: candidatos.filter(c => c.status === "SHORTLISTED").length,
    HIRED: candidatos.filter(c => c.status === "HIRED").length,
  };

  return (
    <div className="max-w-7xl mx-auto font-sans">
      
      {/* HEADER COM DROPDOWN E BOTÃO VOLTAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        
        <div className="flex items-center gap-4">
          {/* BOTÃO DE VOLTAR */}
          {jobIdFromUrl && (
            <Link 
              href="/empresa/vagas" 
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              title="Voltar às minhas vagas"
            >
              {/* O erro do strokeLinelinejoin estava aqui. Corrigido para strokeLinejoin */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Link>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de Candidatos</h1>
            <p className="text-sm text-slate-500">
              {selectedJobId === "all" 
                ? "Selecciona uma vaga para gerir os candidatos" 
                : `${vagas.find(v => v.id === selectedJobId)?.title} · ${counts.ALL} candidatos`}
            </p>
          </div>
        </div>
        
        <div className="relative w-full md:w-auto">
          <select 
            value={selectedJobId} 
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full md:w-64 appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm"
          >
            <option value="all">Seleccionar Vaga...</option>
            {vagas.map(v => (
              <option key={v.id} value={v.id}>{v.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* TABS DE FILTRO */}
      <div className="flex border-b border-slate-200 mb-6 gap-8 overflow-x-auto custom-scrollbar">
        {[
          { id: "ALL", label: "Todos" }, 
          { id: "PENDING", label: "Pendentes" }, 
          { id: "REVIEWING", label: "Em análise" }, 
          { id: "SHORTLISTED", label: "Pré-sel." }, 
          { id: "HIRED", label: "Contratados" }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`pb-4 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label} ({counts[tab.id as keyof typeof counts]})
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
          </button>
        ))}
      </div>

      {/* TABELA DE RESULTADOS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Candidato</th>
              <th className="px-6 py-4">Ilha</th>
              <th className="px-6 py-4 text-center">Data</th>
              <th className="px-6 py-4 text-center">CV</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></td></tr>
            ) : selectedJobId === "all" ? (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium italic">Escolhe uma vaga no menu superior para listar os candidatos.</td></tr>
            ) : candidatosFiltrados.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400">Nenhum candidato encontrado nesta categoria.</td></tr>
            ) : (
              candidatosFiltrados.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/empresa/candidatos/${cand.candidate.id}`} className="group block">
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {cand.candidate.firstName} {cand.candidate.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{cand.candidate.user.email}</p>
                    </Link>
                </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {cand.candidate.island.charAt(0) + cand.candidate.island.slice(1).toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 whitespace-nowrap">
                    {new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short' }).format(new Date(cand.appliedAt))}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => visualizarCV(cand.candidate.cvUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-400" /> Ver CV
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cand.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 
                      cand.status === 'REVIEWING' ? 'bg-blue-50 text-blue-600' :
                      cand.status === 'SHORTLISTED' ? 'bg-purple-50 text-purple-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        cand.status === 'PENDING' ? 'bg-amber-500' : 
                        cand.status === 'REVIEWING' ? 'bg-blue-500' :
                        cand.status === 'SHORTLISTED' ? 'bg-purple-500' :
                        'bg-emerald-500'
                      }`}></span>
                      {cand.status === 'PENDING' ? 'Pendente' : 
                       cand.status === 'REVIEWING' ? 'Análise' :
                       cand.status === 'SHORTLISTED' ? 'Pré-sel.' : 'Contratado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end items-center gap-2">
                      {cand.status === 'PENDING' && (
                        <>
                          <button onClick={() => mudarStatus(cand.id, 'REVIEWING')} className="px-4 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">Analisar</button>
                          <button onClick={() => mudarStatus(cand.id, 'REJECTED')} className="px-4 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">Rejeitar</button>
                        </>
                      )}
                      {cand.status === 'REVIEWING' && (
                        <>
                          <button onClick={() => mudarStatus(cand.id, 'SHORTLISTED')} className="px-4 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">Pré-sel.</button>
                          <button onClick={() => mudarStatus(cand.id, 'REJECTED')} className="px-4 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">Rejeitar</button>
                        </>
                      )}
                      {cand.status === 'SHORTLISTED' && (
                        <>
                          <button onClick={() => mudarStatus(cand.id, 'HIRED')} className="px-4 py-1.5 bg-[#0f9d58] text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm">Contratar</button>
                          <button onClick={() => mudarStatus(cand.id, 'REJECTED')} className="px-4 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">Rejeitar</button>
                        </>
                      )}
                      {cand.status === 'HIRED' && (
                        <span className="text-xs font-bold text-emerald-600 px-4">Contratado ✅</span>
                      )}
                      {cand.status === 'REJECTED' && (
                        <span className="text-xs font-bold text-red-400 px-4">Rejeitado</span>
                      )}
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

// --- 3. Wrapper Principal com Suspense ---
export default function GestaoCandidatosPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>}>
      <GestaoCandidatosContent />
    </Suspense>
  );
}