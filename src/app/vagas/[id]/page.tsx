// src/app/vagas/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BadgeCheck, Clock, MapPin, Briefcase, GraduationCap, Building2 } from "lucide-react";
import BotoesInterativosVaga from "./BotoesInterativosVaga";
import BotaoVoltar from "./BotaoVoltar";

// --- Dicionários de Tradução ---
const traducaoIlha: Record<string, string> = {
  SANTIAGO: "Santiago", SAO_VICENTE: "São Vicente", SAL: "Sal", 
  SANTO_ANTAO: "Santo Antão", FOGO: "Fogo", BOA_VISTA: "Boa Vista", 
  SAO_NICOLAU: "São Nicolau", BRAVA: "Brava", MAIO: "Maio",
};

const traducaoContrato: Record<string, string> = {
  PERMANENT: "Contrato Efectivo", TEMPORARY: "Temporário", INTERNSHIP: "Estágio",
};

const traducaoExperiencia: Record<string, string> = {
  NO_EXPERIENCE: "Sem experiência", JUNIOR: "Júnior (1-2 anos)", 
  MID: "Pleno (3-5 anos)", SENIOR: "Sénior (5+ anos)",
};

const traducaoSector: Record<string, string> = {
  TOURISM: "Turismo & Hotelaria", TECHNOLOGY: "Tecnologia & TI", 
  COMMERCE: "Comércio", CONSTRUCTION: "Construção", HEALTH: "Saúde", 
  EDUCATION: "Educação", OTHER: "Outros Sectores",
};

// --- Helpers ---
function formatarTempoPassado(data: Date) {
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias === 0) return "Hoje";
  if (diffDias === 1) return "Há 1 dia";
  return `Há ${diffDias} dias`;
}

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" }).format(data);
}

const formatarTexto = (texto: string) => {
  return texto.split('\n').map((linha, i) => (
    <span key={i}>{linha}<br /></span>
  ));
};

export default async function VagaDetalhesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  // 1. Incrementar visualizações
  await prisma.jobListing.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {});

  // 2. Buscar dados da vaga
  const vaga = await prisma.jobListing.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      _count: { select: { applications: true } }
    }
  });

  if (!vaga || vaga.status !== "ACTIVE") notFound();

  // 3. Verificar estado do utilizador (se é candidato)
  let isSaved = false;
  let hasApplied = false;

  if (session && session.user.role === "CANDIDATE") {
    const saved = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId: vaga.id } }
    });
    isSaved = !!saved;

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) {
      const app = await prisma.application.findUnique({
        where: { candidateId_jobId: { candidateId: profile.id, jobId: vaga.id } }
      });
      hasApplied = !!app;
    }
  }

  const letraLogo = vaga.company.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900 leading-none">CV<span className="text-blue-700">emprego</span></span>
        </Link>
        <Link href="/dashboard" className="text-sm font-bold bg-blue-700 text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-all shadow-md shadow-blue-200">
          O Meu Painel
        </Link>
      </header>

      <main className="max-w-6xl mx-auto w-full px-4 py-8">
        
        <div className="mb-6">
            <BotaoVoltar />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <div className="flex-1 w-full space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-[24px] flex items-center justify-center flex-shrink-0 shadow-inner">
                  <span className="text-3xl font-black text-blue-700">{letraLogo}</span>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{vaga.title}</h1>
                  <div className="flex flex-wrap items-center text-slate-500 text-sm gap-2 mb-6">
                    <span className="font-bold text-slate-700">{vaga.company.name}</span>
                    <span className="text-slate-300">•</span>
                    <span>{traducaoIlha[vaga.island]}, Cabo Verde</span>
                    {vaga.company.isVerified && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          <BadgeCheck className="w-3 h-3 mr-1" /> Verificado
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      <MapPin className="w-3.5 h-3.5 mr-1.5" /> {traducaoIlha[vaga.island]}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Briefcase className="w-3.5 h-3.5 mr-1.5" /> {traducaoContrato[vaga.contractType]}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <Building2 className="w-3.5 h-3.5 mr-1.5" /> {traducaoSector[vaga.sector]}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> {traducaoExperiencia[vaga.experienceLevel]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest text-[11px]">Sobre a vaga</h2>
              <div className="text-slate-600 text-base leading-relaxed space-y-4">
                {formatarTexto(vaga.description)}
              </div>

              {vaga.requirements && (
                <>
                  <h2 className="text-lg font-black text-slate-900 mt-12 mb-6 uppercase tracking-widest text-[11px]">Requisitos</h2>
                  <div className="text-slate-600 text-base leading-relaxed space-y-4">
                    {formatarTexto(vaga.requirements)}
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-900 rounded-[32px] p-10 text-white shadow-xl shadow-slate-200">
              <h2 className="text-lg font-bold mb-4">Sobre {vaga.company.name}</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
                {vaga.company.description || "Empresa registada na plataforma CVemprego."}
              </p>
              <Link href={`/empresas/${vaga.company.id}`}>
                <button className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-all text-sm">
                    Ver perfil da empresa →
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-[32px] border-2 border-blue-600 p-8 shadow-xl shadow-blue-100">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Salário mensal</p>
              <p className="text-3xl font-black text-slate-900 mb-8 leading-tight">
                {vaga.salaryMin && vaga.salaryMax 
                  ? `${vaga.salaryMin/1000}k–${vaga.salaryMax/1000}k ECV` 
                  : vaga.salaryMin 
                    ? `> ${vaga.salaryMin} ECV` 
                    : "A combinar"
                }
              </p>

              {vaga.deadline && (
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 mb-8 bg-orange-50 p-3 rounded-xl border border-orange-100">
                  <Clock className="w-4 h-4" /> Prazo: {formatarData(vaga.deadline)}
                </div>
              )}

              <BotoesInterativosVaga jobId={vaga.id} initialSaved={isSaved} hasApplied={hasApplied} />
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Resumo</h3>
              <div className="space-y-5 text-sm">
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-bold">Tipo</span>
                  <span className="font-bold text-slate-900">{traducaoContrato[vaga.contractType]}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-3">
                  <span className="text-slate-400 font-bold">Experiência</span>
                  <span className="font-bold text-slate-900">{traducaoExperiencia[vaga.experienceLevel]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Publicado</span>
                  <span className="font-bold text-slate-900">{formatarTempoPassado(vaga.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}