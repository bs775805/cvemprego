"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Building2, 
  CreditCard, 
  PieChart, 
  LogOut,
  ChevronRight
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

interface Section {
  title: string;
  items: MenuItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const sections: Section[] = [
    {
      title: "Gestão",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { name: "Utilizadores", icon: Users, path: "/admin/utilizadores" },
        { name: "Vagas", icon: Briefcase, path: "/admin/vagas" },
        { name: "Empresas", icon: Building2, path: "/admin/empresas" },
      ]
    },
    {
      title: "Monetização",
      items: [
        { name: "Pagamentos", icon: CreditCard, path: "/admin/pagamentos", badge: 2 },
      ]
    },
    {
      title: "Sistema",
      items: [
        { name: "Relatórios", icon: PieChart, path: "/admin/relatorios" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      <aside className="w-72 bg-[#0f172a] text-slate-400 flex flex-col hidden md:flex sticky top-0 h-screen z-50 border-r border-white/5 shadow-2xl">
        
        <div className="px-5 pt-6 pb-5 flex justify-center items-center border-b border-white/5">
  <Link href="/" className="group w-full">
    <div className="bg-white rounded-2xl px-4 py-4 w-full flex flex-col items-center gap-2 shadow-lg shadow-black/30 group-hover:shadow-black/40 transition-all group-hover:scale-[1.02]">
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
        
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 p-4 bg-red-500/5 rounded-2xl border border-red-500/10 transition-colors cursor-default">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg border border-red-400/30">
               <span className="text-xl">{session?.user?.name?.charAt(0).toUpperCase() || "A"}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {session?.user?.name || "Admin Master"}
              </p>
              <span className="text-[10px] text-red-400 font-black uppercase tracking-widest mt-1 block">Acesso Total</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pb-8">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link key={item.name} href={item.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm group ${
                        isActive 
                        ? "bg-red-600 text-white shadow-xl shadow-red-900/40" 
                        : "hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && !isActive && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-all text-sm font-bold group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-end px-8 sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Painel Administrativo</span>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            </div>
        </header>
        <div className="p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}