// src/app/vagas/page.tsx
"use client";

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2, ChevronDown, Star, BadgeCheck } from "lucide-react";

// --- 1. Tipagens e Mapas de Tradução ---
interface Vaga {
  id: string;
  title: string;
  island: string;
  sector: string;
  contractType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isFeatured: boolean; // Campo crucial para a monetização
  createdAt: string;
  company: {
    name: string;
    isVerified: boolean;
  };
}

const ilhasMap = [
  { id: "SANTIAGO", label: "Santiago" }, { id: "SAO_VICENTE", label: "São Vicente" },
  { id: "SAL", label: "Sal" }, { id: "SANTO_ANTAO", label: "Santo Antão" },
  { id: "FOGO", label: "Fogo" }, { id: "BOA_VISTA", label: "Boa Vista" },
  { id: "SAO_NICOLAU", label: "São Nicolau" }, { id: "BRAVA", label: "Brava" }, { id: "MAIO", label: "Maio" }
];

const contratosMap = [
  { id: "PERMANENT", label: "Efectivo" }, { id: "TEMPORARY", label: "Temporário" }, { id: "INTERNSHIP", label: "Estágio" }
];

const expMap = [
  { id: "NO_EXPERIENCE", label: "Sem experiência" }, { id: "JUNIOR", label: "Júnior (1-2 anos)" },
  { id: "MID", label: "Médio (3-5 anos)" }, { id: "SENIOR", label: "Sénior (5+ anos)" }
];

export default function VagasPage() {
  // --- 2. Estados dos Filtros ---
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [ilhaSelect, setIlhaSelect] = useState("");
  const [sectorSelect, setSectorSelect] = useState("");
  const [selectedIslands, setSelectedIslands] = useState<string[]>([]);
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [selectedExp, setSelectedExp] = useState<string[]>([]);

  // --- 3. Função de Carregamento Dinâmico (Lógica de API) ---
  const carregarVagas = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (busca.trim()) params.append("q", busca);
      if (sectorSelect) params.append("sector", sectorSelect);
      
      // Lógica estrita para Ilhas
      const islandsArr = [...selectedIslands];
      if (ilhaSelect !== "" && !islandsArr.includes(ilhaSelect)) {
        islandsArr.push(ilhaSelect);
      }
      if (islandsArr.length > 0) params.append("island", islandsArr.join(","));
      
      if (selectedContracts.length > 0) params.append("contract", selectedContracts.join(","));
      if (selectedExp.length > 0) params.append("experience", selectedExp.join(","));

      const res = await fetch(`/api/vagas?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setVagas(json.data);
      }
    } catch (error) {
      console.error("Erro ao carregar vagas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [busca, ilhaSelect, sectorSelect, selectedIslands, selectedContracts, selectedExp]);

  useEffect(() => {
    carregarVagas();
  }, [carregarVagas]);

  // --- 4. Helpers de Interface ---
  const toggleFilter = (list: string[], setList: Dispatch<SetStateAction<string[]>>, id: string) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const limparFiltros = () => {
    setBusca(""); setIlhaSelect(""); setSectorSelect("");
    setSelectedIslands([]); setSelectedContracts([]); setSelectedExp([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col text-slate-900">
      
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center">
            <Image src="/logo-cvemprego.png" alt="Logo" width={180} height={50} className="h-10 w-auto object-contain" priority />
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-blue-700 transition-colors">Início</Link>
          <Link href="/vagas" className="text-blue-700 underline underline-offset-8 decoration-2">Vagas</Link>
          <Link href="/empresas" className="hover:text-blue-700 transition-colors">Empresas</Link>
        </div>
        <Link href="/dashboard" className="text-sm font-black bg-blue-700 text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all active:scale-95">
          Painel
        </Link>
      </header>

      {/* SEARCH BAR DINÂMICA */}
      <div className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input 
              value={busca} 
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar função, empresa ou palavra-chave..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
            />
          </div>
          <div className="w-full md:w-64 relative">
            <select value={ilhaSelect} onChange={(e) => setIlhaSelect(e.target.value)} className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none cursor-pointer appearance-none font-bold text-slate-700">
                <option value="">Todas as ilhas</option>
                {ilhasMap.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="text-sm text-slate-400 font-bold uppercase tracking-widest md:ml-4">
            {isLoading ? "..." : `${vagas.length} vagas`}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 py-10 flex flex-col md:flex-row gap-10">
        
        {/* SIDEBAR DE FILTROS */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 sticky top-28 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Filtros Avançados</h3>
            
            <div className="mb-10">
              <h4 className="font-bold text-sm mb-4 text-slate-900">Tipo de Contrato</h4>
              <div className="space-y-3">
                {contratosMap.map(c => (
                  <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedContracts.includes(c.id)} onChange={() => toggleFilter(selectedContracts, setSelectedContracts, c.id)} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="font-bold text-sm mb-4 text-slate-900">Nível de Experiência</h4>
              <div className="space-y-3">
                {expMap.map(e => (
                  <label key={e.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedExp.includes(e.id)} onChange={() => toggleFilter(selectedExp, setSelectedExp, e.id)} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{e.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="font-bold text-sm mb-4 text-slate-900">Localização (Ilhas)</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {ilhasMap.map(i => (
                  <label key={i.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={selectedIslands.includes(i.id)} onChange={() => toggleFilter(selectedIslands, setSelectedIslands, i.id)} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{i.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={limparFiltros} className="w-full py-3 bg-slate-50 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-100 transition-colors uppercase tracking-widest border border-slate-100">
              Limpar Filtros
            </button>
          </div>
        </aside>

        {/* LISTAGEM DE VAGAS DINÂMICA */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-slate-200 border-dashed">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4 opacity-20" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">A actualizar resultados...</p>
            </div>
          ) : vagas.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-[32px] border border-slate-200 border-dashed shadow-inner">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Nenhuma vaga corresponde aos teus filtros.</p>
                <button onClick={limparFiltros} className="mt-4 text-blue-600 font-black text-xs uppercase hover:underline">Ver todas as vagas</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {vagas.map((vaga) => {
                const isFeatured = vaga.isFeatured;
                return (
                  <Link 
                    key={vaga.id} 
                    href={`/vagas/${vaga.id}`} 
                    className={`block p-8 bg-white border-2 rounded-[32px] transition-all group relative overflow-hidden ${
                      isFeatured 
                      ? 'border-amber-400 shadow-2xl shadow-amber-100/50 scale-[1.01]' 
                      : 'border-transparent hover:border-blue-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5'
                    }`}
                  >
                    {/* Badge de Destaque para Vagas Pagas */}
                    {isFeatured && (
                      <div className="absolute top-0 right-0 bg-amber-400 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
                        <Star className="w-3 h-3 fill-white" /> Vaga em Destaque
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Logo Placeholder / Letra */}
                      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center font-black text-2xl border transition-colors flex-shrink-0 ${
                        isFeatured ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-100'
                      }`}>
                        {vaga.company.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div>
                            <h3 className="font-black text-xl text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-1">
                              {vaga.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-500">{vaga.company.name}</p>
                                {vaga.company.isVerified && (
                                    <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                                )}
                            </div>
                          </div>
                          <div className="text-left lg:text-right flex-shrink-0">
                            <p className="font-black text-slate-900 text-lg">
                              {vaga.salaryMin ? `${vaga.salaryMin/1000}k` : "A combinar"}
                              <span className="text-[10px] ml-1 text-slate-400 uppercase">ECV/mês</span>
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hoje</p>
                          </div>
                        </div>
                        
                        {/* Etiquetas de Categoria */}
                        <div className="flex flex-wrap gap-2 mt-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-slate-200/50">
                            📍 {ilhasMap.find(i => i.id === vaga.island)?.label}
                          </span>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-emerald-100">
                            💼 {contratosMap.find(c => c.id === vaga.contractType)?.label}
                          </span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-blue-100">
                            {expMap.find(e => e.id === vaga.experienceLevel)?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* PAGINAÇÃO SIMPLES (VISUAL) */}
          {!isLoading && vagas.length > 0 && (
            <div className="mt-12 flex justify-center items-center gap-2">
                <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button className="w-10 h-10 rounded-xl bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-200">1</button>
                <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm hover:bg-white transition-colors">2</button>
                <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Funções de ajuda para os ícones no final para evitar erro de re-render
function ChevronLeft({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>
}
function ChevronRight({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
}