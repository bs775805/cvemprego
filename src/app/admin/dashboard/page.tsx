// src/app/admin/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AlertCircle, Check, ArrowUpRight } from "lucide-react";
import Link from "next/link";

// --- Funções de Ajuda ---
function formatarDataLonga(data: Date) {
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }).format(data);
}

export default async function AdminDashboardPage() {
  // 1. Proteger a rota: Apenas ADMIN pode entrar
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Buscar Dados Reais da Base de Dados (com tratamento de erro individual)
  const totalCandidatos = await prisma.user.count({ where: { role: "CANDIDATE" } }).catch(() => 0);
  const totalEmpresas = await prisma.user.count({ where: { role: "EMPLOYER" } }).catch(() => 0);
  const totalVagas = await prisma.jobListing.count().catch(() => 0);
  const totalInscricoes = await prisma.application.count().catch(() => 0);

  // Buscar pagamentos que aguardam confirmação
  const pagamentosPendentes = await prisma.payment.findMany({
    where: { status: "PENDING" },
    include: { company: true },
    take: 5,
    orderBy: { createdAt: 'desc' }
  }).catch(() => []);

  // Buscar vagas recentes para a secção de moderação
  const vagasModeracao = await prisma.jobListing.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { company: true }
  }).catch(() => []);

  // Buscar registos recentes (EXCLUINDO o administrador para não aparecer na lista)
  const candidatosRecentes = await prisma.candidateProfile.findMany({
    where: { 
      user: { role: "CANDIDATE" } 
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { 
      user: { select: { email: true } } 
    }
  }).catch(() => []);

  return (
    <div className="max-w-7xl mx-auto font-sans pb-20">
      
      {/* HEADER DO DASHBOARD */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard Admin</h1>
          <p className="text-sm text-slate-500 font-medium">Visão geral da plataforma CVemprego</p>
        </div>
        <div className="text-right text-slate-400 text-xs font-bold uppercase tracking-widest pt-2">
          {formatarDataLonga(new Date())}
        </div>
      </div>

      {/* MÉTRICAS (4 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-4xl font-black text-slate-900 mb-2">{totalCandidatos}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Candidatos registados</p>
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +48 esta semana
          </p>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-4xl font-black text-slate-900 mb-2">{totalEmpresas}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Empresas activas</p>
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +5 esta semana
          </p>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-4xl font-black text-slate-900 mb-2">{totalVagas}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vagas publicadas</p>
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12 hoje
          </p>
        </div>

        <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <p className="text-4xl font-black text-slate-900 mb-2">{totalInscricoes}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Candidaturas totais</p>
          <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +89 esta semana
          </p>
        </div>
      </div>

      {/* ALERTA DE PAGAMENTOS PENDENTES */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-10 flex items-center justify-between shadow-sm border-dashed">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl text-amber-600 shadow-sm border border-amber-50">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm text-amber-900 font-bold">
            {pagamentosPendentes.length} pagamentos pendentes de confirmação manual. 
            <Link href="/admin/pagamentos" className="ml-2 underline hover:text-amber-700 decoration-amber-200 underline-offset-4">Ver pagamentos →</Link>
          </p>
        </div>
      </div>

      {/* GRID DE TABELAS SECUNDÁRIAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Tabela de Pagamentos Pendentes */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4 px-2 uppercase text-[10px] tracking-widest text-slate-400">Pagamentos pendentes</h3>
          <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 tracking-tighter">Referência</th>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4 text-center">Valor</th>
                  <th className="px-6 py-4 text-right">Acção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {pagamentosPendentes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-slate-400 italic font-medium">
                      Sem pagamentos a aguardar confirmação.
                    </td>
                  </tr>
                ) : (
                  pagamentosPendentes.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-blue-600">{p.reference}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{p.company.name}</td>
                      <td className="px-6 py-4 text-center font-black text-slate-900">{p.amount} ECV</td>
                      <td className="px-6 py-4 text-right">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm active:scale-95">
                          <Check className="w-3.5 h-3.5 inline mr-1" /> Confirmar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela de Vagas para Moderação */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 px-2 uppercase text-[10px] tracking-widest text-slate-400">Vagas para moderar</h3>
          <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                {vagasModeracao.length === 0 ? (
                  <tr><td className="p-10 text-center text-slate-400 italic">Sem vagas pendentes.</td></tr>
                ) : (
                  vagasModeracao.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{v.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{v.company.name}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${v.status === 'ACTIVE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                           {v.status === 'ACTIVE' ? 'Aprovada' : 'Rever'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TABELA DE REGISTOS RECENTES (EM BAIXO) */}
      <h3 className="font-bold text-slate-900 mb-4 px-2 uppercase text-[10px] tracking-widest text-slate-400">Registos recentes</h3>
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm mb-12">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Nome / Email</th>
              <th className="px-8 py-5">Tipo</th>
              <th className="px-8 py-5">Ilha</th>
              <th className="px-8 py-5 text-center">Registado em</th>
              <th className="px-8 py-5 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {candidatosRecentes.length === 0 ? (
              <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic">Ainda não existem registos.</td></tr>
            ) : (
              candidatosRecentes.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 leading-none mb-1">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-slate-400">{c.user.email}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-blue-600 text-[10px] font-black uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">Candidato</span>
                  </td>
                  <td className="px-8 py-5 text-slate-600 font-medium">{c.island}</td>
                  <td className="px-8 py-5 text-center text-slate-400 font-medium">Hoje, {new Date(c.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-8 py-5 text-right">
                     <span className="inline-flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Activo
                     </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}