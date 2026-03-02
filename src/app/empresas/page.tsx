// src/app/empresas/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, MapPin, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EmpresasPublicoPage() {
  const empresas = await prisma.companyProfile.findMany({
    include: { _count: { select: { jobListings: { where: { status: "ACTIVE" } } } } },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-slate-900">CV<span className="text-blue-700">emprego</span></Link>
        <Link href="/login" className="text-sm font-bold text-blue-600 hover:underline">Entrar</Link>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Empresas em Cabo Verde</h1>
          <p className="text-slate-500">Conhece as organizações que estão a recrutar na nossa plataforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresas.map((emp) => (
            <Link key={emp.id} href={`/empresas/${emp.id}`} className="group bg-white p-6 rounded-[24px] border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-[20px] flex items-center justify-center text-3xl font-black text-blue-700 mb-4 group-hover:scale-110 transition-transform">
                {emp.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-700">{emp.name}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{emp.sector}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {emp.island}</span>
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {emp._count.jobListings} vagas</span>
              </div>

              <div className="mt-auto w-full pt-4 border-t border-slate-50 flex justify-center items-center text-blue-600 font-bold text-sm">
                Ver perfil <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}