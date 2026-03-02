// src/app/empresa/candidatos/[id]/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Mail } from "lucide-react";

export default async function PerfilCandidatoEmpresaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "EMPLOYER") redirect("/login");

  // Procuramos o perfil do candidato através do seu ID
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true } },
      experience: true,
      education: true
    }
  });

  if (!candidate) notFound();

  return (
    <div className="max-w-4xl mx-auto font-sans pb-12">
      <Link href="/empresa/candidatos" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à lista de candidatos
      </Link>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        {/* Header Escuro */}
        <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-28 h-28 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl font-black shadow-2xl shadow-blue-500/20">
            {candidate.firstName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{candidate.firstName} {candidate.lastName}</h1>
            <p className="text-blue-300 font-bold text-lg mb-4">{candidate.currentTitle || "Candidato"}</p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-2 font-medium"><MapPin className="w-4 h-4" /> {candidate.island}</span>
              <span className="flex items-center gap-2 font-medium"><Mail className="w-4 h-4" /> {candidate.user.email}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo do Perfil */}
        <div className="p-12 space-y-16">
          {/* Bio */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Apresentação</h2>
            <p className="text-slate-600 leading-relaxed text-lg italic bg-slate-50 p-6 rounded-2xl border-l-4 border-blue-500">
              &quot;{candidate.bio || "Este candidato não escreveu uma apresentação."}&quot;
            </p>
          </div>

          {/* Experiência */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Experiência Profissional
            </h2>
            <div className="space-y-10 border-l-2 border-slate-100 ml-3 pl-8">
              {candidate.experience.length > 0 ? candidate.experience.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <h3 className="font-bold text-xl text-slate-900">{exp.title}</h3>
                  <p className="text-blue-600 font-bold mb-3">{exp.company}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{exp.description}</p>
                </div>
              )) : <p className="text-sm text-slate-400">Nenhuma experiência registada.</p>}
            </div>
          </div>

          {/* Formação */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Percurso Académico
            </h2>
            <div className="space-y-10 border-l-2 border-slate-100 ml-3 pl-8">
              {candidate.education.length > 0 ? candidate.education.map((edu) => (
                <div key={edu.id} className="relative">
                  <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm"></div>
                  <h3 className="font-bold text-xl text-slate-900">{edu.degree}</h3>
                  <p className="text-emerald-600 font-bold mb-2">{edu.institution}</p>
                </div>
              )) : <p className="text-sm text-slate-400">Nenhuma formação registada.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}