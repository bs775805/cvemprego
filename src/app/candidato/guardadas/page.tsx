// src/app/candidato/guardadas/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, MapPin, Briefcase, Heart } from "lucide-react";

export default async function VagasGuardadasPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CANDIDATE") redirect("/login");

  // Ir buscar as vagas guardadas por este utilizador
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    include: {
      job: {
        include: { company: true }
      }
    },
    orderBy: { savedAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Vagas guardadas</h1>

      <div className="flex flex-col gap-4">
        {savedJobs.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-[24px] border border-slate-200">
            <Bookmark className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Ainda não guardaste nenhuma vaga.</p>
            <Link href="/vagas" className="text-blue-600 font-bold mt-2 block hover:underline text-sm">
              Explorar vagas →
            </Link>
          </div>
        ) : (
          savedJobs.map((item) => {
            const vaga = item.job;
            const isInternship = vaga.contractType === "INTERNSHIP";
            
            return (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-sm transition-shadow group">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-blue-700 text-xl border border-blue-100">
                    {vaga.company.name.charAt(0)}
                  </div>
                  <div>
                    <Link href={`/vagas/${vaga.id}`} className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                      {vaga.title}
                    </Link>
                    <p className="text-sm text-slate-500 mb-3">{vaga.company.name}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <MapPin className="w-3 h-3 mr-1" /> {vaga.island.charAt(0) + vaga.island.slice(1).toLowerCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${isInternship ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        <Briefcase className="w-3 h-3 mr-1" /> {vaga.contractType === "PERMANENT" ? "Efectivo" : vaga.contractType === "TEMPORARY" ? "Temporário" : "Estágio"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                    Remover <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}