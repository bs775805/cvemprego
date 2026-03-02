// src/app/empresa/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users, Eye, FileText, Briefcase } from "lucide-react";

// Configuração de cores para os estados (mesma do candidato para consistência)
const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pendente" },
  REVIEWING: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Análise" },
  SHORTLISTED: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", label: "Pré-sel." },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Recusado" },
  HIRED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Contratado" },
};

export default async function EmpresaDashboard() {
  // 1. Validar Sessão
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYER") {
    redirect("/login");
  }

  // 2. Buscar Perfil da Empresa e as suas Vagas
  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      jobListings: {
        include: {
          _count: { select: { applications: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!company) redirect("/register");

  // 3. Buscar os Candidatos Recentes (Candidaturas a todas as vagas desta empresa)
  const candidaturasRecentes = await prisma.application.findMany({
    where: {
      job: { companyId: company.id }
    },
    include: {
      candidate: true,
      job: true,
    },
    orderBy: { appliedAt: 'desc' },
    take: 5 // Apenas os 5 mais recentes para o resumo
  });

  // 4. Cálculos das métricas
  const vagasActivas = company.jobListings.filter(j => j.status === "ACTIVE").length;
  const totalCandidaturas = company.jobListings.reduce((acc, job) => acc + job._count.applications, 0);
  const totalVisualizacoes = company.jobListings.reduce((acc, job) => acc + job.viewCount, 0);
  
  // Cálculo de candidaturas na última semana (simulado com data fixa para exemplo)
  const umaSemanaAtras = new Date();
  umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
  const novasCandidaturasSemana = candidaturasRecentes.filter(c => c.appliedAt > umaSemanaAtras).length;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Painel da Empresa</h1>
          <p className="text-slate-500 text-sm">{company.name} · {company.island}</p>
        </div>
        <Link href="/empresa/vagas/nova" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nova vaga
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-3">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Vagas activas</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{vagasActivas}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Candidaturas totais</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalCandidaturas}</p>
          <p className="text-xs font-medium text-emerald-600 mt-1">↑ {novasCandidaturasSemana} esta semana</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-3">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Novas candidaturas</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{novasCandidaturasSemana}</p>
          <p className="text-xs text-slate-400 mt-1">Nos últimos 7 dias</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-slate-400 mb-3">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Visualizações</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalVisualizacoes}</p>
          <p className="text-xs text-slate-400 mt-1">Total acumulado</p>
        </div>
      </div>

      {/* Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lado Esquerdo: Minhas Vagas */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            Vagas activas
          </h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Vaga</th>
                  <th className="px-6 py-4 text-center">Cand.</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {company.jobListings.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Nenhuma vaga publicada.</td></tr>
                ) : (
                  company.jobListings.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{job.title}</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">{job._count.applications}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 ${job.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'} text-[11px] font-bold`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {job.status === 'ACTIVE' ? 'Activa' : 'Fechada'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado Direito: Candidatos Recentes */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Candidatos recentes</h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Candidato</th>
                  <th className="px-6 py-4">Vaga</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidaturasRecentes.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Ainda sem candidaturas.</td></tr>
                ) : (
                  candidaturasRecentes.map(app => {
                    const status = statusConfig[app.status] || statusConfig.PENDING;
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{app.candidate.firstName} {app.candidate.lastName.charAt(0)}.</td>
                        <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[120px]">{app.job.title}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 ${status.bg} ${status.text} px-2 py-1 rounded-full text-[10px] font-bold`}>
                            <span className={`w-1.2 h-1.2 rounded-full ${status.dot}`}></span>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}