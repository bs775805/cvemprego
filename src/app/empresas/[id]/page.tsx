// src/app/empresas/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, ExternalLink, Briefcase } from "lucide-react";
import BotaoVoltarVaga from "./BotaoVoltarVaga";

export default async function PerfilPublicoEmpresa({ params }: { params: { id: string } }) {
  const company = await prisma.companyProfile.findUnique({
    where: { id: params.id },
    include: {
      jobListings: { where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }
    }
  });
  if (!company) notFound();
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-slate-900">CV<span className="text-blue-700">emprego</span></Link>
      </header>
      <main className="max-w-4xl mx-auto py-12 px-4">

        <BotaoVoltarVaga />

        {/* Cartão Header Empresa */}
        <div className="bg-white rounded-3xl border border-slate-200 p-10 mb-8 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center text-5xl font-black text-blue-700">
            {company.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{company.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {company.sector}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {company.island}</span>
              {company.website && (
                <a href={`https://${company.website}`} target="_blank" className="flex items-center gap-1.5 text-blue-600 hover:underline"><ExternalLink className="w-4 h-4" /> Website</a>
              )}
            </div>
          </div>
        </div>

        {/* Sobre */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sobre a empresa</h2>
          <p className="text-slate-600 leading-relaxed">{company.description || "Esta empresa não forneceu uma descrição detalhada."}</p>
        </div>

        {/* Vagas Abertas */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" /> Vagas em aberto ({company.jobListings.length})</h2>
          <div className="space-y-4">
            {company.jobListings.map(vaga => (
              <Link key={vaga.id} href={`/vagas/${vaga.id}`} className="block bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 transition-colors shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{vaga.title}</h3>
                    <p className="text-sm text-slate-500">{vaga.contractType === 'PERMANENT' ? 'Efectivo' : 'Outro'} • {vaga.island}</p>
                  </div>
                  <span className="text-blue-600 font-semibold text-sm">Ver vaga →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}