// src/app/empresa/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Building, 
  LogOut,
  ChevronRight,
  Star
} from "lucide-react";

// Interface para garantir tipagem dos menus
interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Menu de Recrutamento Principal
  const menuRecrutamento: MenuItem[] = [
    { name: "Visão Geral", icon: LayoutDashboard, path: "/empresa/dashboard" },
    { name: "As minhas vagas", icon: FileText, path: "/empresa/vagas" },
    { name: "Candidatos", icon: Users, path: "/empresa/candidatos", badge: 5 },
  ];

  // Menu de Gestão e Crescimento
  const menuGestao: MenuItem[] = [
    { name: "Promover Vaga", icon: Star, path: "/empresa/promover" },
    { name: "Perfil da Empresa", icon: Building, path: "/empresa/perfil" },
  ];

  const R2_URL = "https://pub-cc443c3ffe6e43e581c3431029871225.r2.dev";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      
      {/* SIDEBAR FIXA */}
      <aside className="w-72 bg-[#0f172a] text-slate-400 flex flex-col hidden md:flex sticky top-0 h-screen z-50 border-r border-white/5 shadow-2xl">
        
        {/* LOGO CONTAINER */}
        <div className="px-5 pt-6 pb-5 flex justify-center items-center border-b border-white/5 bg-[#f8fafc] mb-6 shadow-sm">
          <Link href="/" className="group w-full">
            <div className="bg-white rounded-2xl px-4 py-4 w-full flex flex-col items-center gap-2 shadow-lg shadow-black/5 group-hover:scale-[1.02] transition-all">
              <Image 
                src="/logo-cvemprego.png" 
                alt="CVemprego" 
                width={200} 
                height={60} 
                className="w-full max-w-[160px] h-14 object-contain"
                priority 
              />
              <p className="text-sm font-black tracking-wide leading-none">
                <span className="text-blue-600">CV</span>
                <span className="text-red-500">emprego</span>
              </p>
            </div>
          </Link>
        </div>
        
        {/* CARD DE PERFIL DO UTILIZADOR */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black overflow-hidden relative shadow-lg border border-blue-400/30">
              {session?.user?.image ? (
                <Image 
                  src={`${R2_URL}/${session.user.image}`} 
                  alt="Logo Empresa" 
                  fill 
                  className="object-cover" 
                  unoptimized
                />
              ) : (
                <span className="text-xl">{session?.user?.name?.charAt(0).toUpperCase() || "E"}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {session?.user?.name || "Empresa"}
              </p>
              <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-1 block tracking-tighter">Painel Empresa</span>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Secção Recrutamento */}
          <div>
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Recrutamento</p>
            <div className="space-y-1.5">
              {menuRecrutamento.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link key={item.name} href={item.path}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all font-semibold text-sm group ${
                      isActive 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" 
                      : "hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && !isActive && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Secção Administração e Destaques */}
          <div>
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Administração</p>
            <div className="space-y-1.5">
              {menuGestao.map((item) => {
                const isActive = pathname === item.path;
                const isPromote = item.name === "Promover Vaga";
                return (
                  <Link key={item.name} href={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
                      isActive 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" 
                      : isPromote 
                        ? "text-amber-400 hover:bg-amber-400/10 hover:text-amber-300" 
                        : "hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-white" : isPromote ? "text-amber-400" : "text-slate-500"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* RODAPÉ SIDEBAR / LOGOUT */}
        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all text-sm font-bold group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Sair do Portal</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <header className="bg-[#f8fafc] border-b border-slate-200 h-16 flex items-center justify-end px-8 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Painel Administrativo</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
        </header>
        <div className="p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}