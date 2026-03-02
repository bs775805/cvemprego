// src/app/candidato/candidaturas/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, ExternalLink } from "lucide-react";

interface StatusStyle {
  label: string;
  color: string;
}

const statusMap: Record<string, StatusStyle> = {
  PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
  REVIEWING: { label: "Em Análise", color: "bg-blue-100 text-blue-700" },
  SHORTLISTED: { label: "Pré-seleccionado", color: "bg-purple-100 text-purple-700" },
  REJECTED: { label: "Não aceite", color: "bg-red-100 text-red-700" },
  HIRED: { label: "Contratado!", color: "bg-emerald-100 text-emerald-700" },
};

export default async function MinhasCandidaturasPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const candidaturas = await prisma.application.findMany({
    where: { candidate: { userId: session.user.id } },
    include: {
      job: { include: { company: true } }
    },
    orderBy: { appliedAt: 'desc' }
  });

  return (
    <div className="max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">As minhas candidaturas</h1>
      <p className="text-slate-500 mb-8">Acompanha o estado de todos os teus envios</p>

      <div className="grid grid-cols-1 gap-4">
        {candidaturas.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[32px] border border-slate-200">
            <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Ainda não te candidataste a nenhuma vaga.</p>
            <Link href="/vagas" className="text-blue-600 font-bold mt-2 block hover:underline text-sm">Procurar empregos agora →</Link>
          </div>
        ) : (
          candidaturas.map((cand) => (
            <div key={cand.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-200">
                  {cand.job.company.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{cand.job.title}</h3>
                  <p className="text-sm text-slate-500">{cand.job.company.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {cand.job.island}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(cand.appliedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusMap[cand.status]?.color || "bg-slate-100"}`}>
                  {statusMap[cand.status]?.label || cand.status}
                </span>
                <Link href={`/vagas/${cand.job.id}`} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}