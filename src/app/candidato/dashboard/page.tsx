// src/app/candidato/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Search, AlertTriangle } from "lucide-react";

// Dicionário de cores e traduções para os estados da candidatura
const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pendente" },
  REVIEWING: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Em análise" },
  SHORTLISTED: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", label: "Pré-sel." },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Não aceite" },
  HIRED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Contratado!" },
};

// Formatar data (ex: "20 Fev")
function formatarDataCurta(data: Date) {
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short' }).format(data);
}

export default async function CandidatoDashboard() {
  // 1. Validar Sessão
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CANDIDATE") {
    redirect("/login");
  }

  // 2. Buscar o Perfil do Candidato
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/register"); // Redireciona por segurança
  }

  // 3. Buscar as Candidaturas deste utilizador
  const candidaturas = await prisma.application.findMany({
    where: { candidateId: profile.id },
    include: {
      job: {
        include: { company: true }
      }
    },
    orderBy: { appliedAt: "desc" }
  });

  // 4. Buscar vagas sugeridas (Vamos pegar nas 2 últimas publicadas na plataforma para simular)
  const vagasSugeridas = await prisma.jobListing.findMany({
    where: { status: "ACTIVE" },
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  // Cálculos das métricas
  const totalCandidaturas = candidaturas.length;
  const emAnalise = candidaturas.filter(c => c.status === "REVIEWING").length;
  const preSelecionado = candidaturas.filter(c => c.status === "SHORTLISTED").length;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Olá, {profile.firstName} 👋</h1>
          <p className="text-slate-500 text-sm">Aqui está o resumo das tuas candidaturas</p>
        </div>
        <Link href="/vagas" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Search className="w-4 h-4" /> Procurar vagas
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalCandidaturas}</p>
          <p className="text-sm text-slate-500 mb-3">Candidaturas</p>
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1">Totais submetidas</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-3xl font-bold text-slate-900 mb-1">{emAnalise}</p>
          <p className="text-sm text-slate-500 mb-3">Em análise</p>
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1">Aguardam resposta</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-3xl font-bold text-slate-900 mb-1">{preSelecionado}</p>
          <p className="text-sm text-slate-500 mb-3">Pré-seleccionado</p>
          <p className="text-xs font-medium text-slate-400 flex items-center gap-1">Passaram à próxima fase</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{profile.profileComplete}%</p>
            <p className="text-sm text-slate-500 mb-3">Perfil completo</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-auto">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${profile.profileComplete}%` }}></div>
          </div>
        </div>
      </div>

      {/* Alert (Só aparece se o perfil for < 100%) */}
      {profile.profileComplete < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <AlertTriangle className="text-yellow-600 w-5 h-5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Perfil incompleto</span> — Adiciona a tua experiência profissional para aumentar as tuas hipóteses.{" "}
            <Link href="/candidato/perfil" className="font-semibold underline hover:text-yellow-900">Completar perfil →</Link>
          </p>
        </div>
      )}

      {/* Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Candidaturas recentes</h3>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Vaga</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidaturas.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      Ainda não te candidataste a nenhuma vaga.
                    </td>
                  </tr>
                ) : (
                  candidaturas.map((cand) => {
                    const status = statusConfig[cand.status] || statusConfig.PENDING;
                    return (
                      <tr key={cand.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/vagas/${cand.job.id}`} className="font-medium text-slate-900 hover:text-blue-600 truncate block max-w-[180px]">
                            {cand.job.title}
                          </Link>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{cand.job.company.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 ${status.bg} ${status.text} px-2 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 whitespace-nowrap">
                          {formatarDataCurta(cand.appliedAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Vagas sugeridas para ti</h3>
          <div className="space-y-3">
            {vagasSugeridas.map((vaga) => (
              <Link key={vaga.id} href={`/vagas/${vaga.id}`} className="block">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700 font-bold border border-blue-100 flex-shrink-0">
                    {vaga.company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm line-clamp-1">{vaga.title}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{vaga.company.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}