// src/app/sobre/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  Users, Building2, Briefcase, 
  Target, ShieldCheck, Heart, 
  Map
} from "lucide-react";

export default async function SobrePage() {
  // 1. Buscar estatísticas reais para mostrar o crescimento
  const [totalCandidatos, totalEmpresas, totalVagas] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.jobListing.count({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col text-slate-900">
      
      {/* 1. NAVBAR / HEADER */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo-cvemprego.png" 
            alt="CVemprego Logo" 
            width={200}
            height={60} 
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-blue-700 transition-colors">Início</Link>
          <Link href="/vagas" className="hover:text-blue-700 transition-colors">Vagas</Link>
          <Link href="/empresas" className="hover:text-blue-700 transition-colors">Empresas</Link>
          <Link href="/sobre" className="text-blue-700 underline underline-offset-8 decoration-2">Sobre</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-700">Entrar</Link>
          <Link href="/register" className="text-sm font-black bg-blue-700 text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-100 transition-all">
            Criar Conta
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION - PROPÓSITO */}
      <section className="bg-white py-24 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            Missão & Visão
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8 tracking-tighter">
            Digitalizar o mercado de trabalho em <span className="text-blue-700">Cabo Verde</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed font-medium">
            O CVemprego nasceu da necessidade de centralizar e simplificar a ligação entre o talento cabo-verdiano e as organizações que impulsionam a nossa economia em todas as 9 ilhas.
          </p>
        </div>
      </section>

      {/* 3. VALORES */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Foco Local</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Desenhado especificamente para o contexto de Cabo Verde, respeitando as particularidades de cada ilha e sector económico.</p>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group text-white bg-slate-900 border-none">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Transparência</h3>
            <p className="text-slate-400 leading-relaxed text-sm">Garantimos que as empresas são verificadas e que os candidatos acompanham o estado real das suas candidaturas.</p>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Acessibilidade</h3>
            <p className="text-slate-500 leading-relaxed text-sm">Uma interface simples e gratuita para candidatos, permitindo que o primeiro emprego esteja à distância de um clique.</p>
          </div>
        </div>
      </section>

      {/* 4. ESTATÍSTICAS REAIS EM TEMPO REAL */}
      <section className="py-24 bg-[#0b2853] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">O nosso impacto hoje</h2>
            <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-black text-white">{totalCandidatos.toLocaleString()}</span>
              <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Users className="w-3 h-3" /> Talentos Registados
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-black text-white">{totalEmpresas.toLocaleString()}</span>
              <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Building2 className="w-3 h-3" /> Empresas Parceiras
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-black text-white">{totalVagas.toLocaleString()}</span>
              <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Briefcase className="w-3 h-3" /> Vagas em Aberto
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-5xl font-black text-white">9</span>
              <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Map className="w-3 h-3" /> Ilhas Conectadas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COMO FUNCIONA */}
      <section className="py-24 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-black mb-4 tracking-tight text-slate-900">Como funciona a plataforma?</h2>
          <p className="text-slate-500 font-medium italic underline decoration-blue-100 underline-offset-4 text-lg">Simplicidade do registo à contratação</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-8">
            <h3 className="text-xl font-black text-blue-700 uppercase tracking-widest text-[11px] mb-6">Para Candidatos</h3>
            {[
              "Cria o teu perfil profissional em minutos.",
              "Faz upload do teu currículo em PDF.",
              "Pesquisa e filtra por ilha e sector.",
              "Candidata-te e acompanha o estado no teu painel."
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i+1}</div>
                <p className="text-slate-600 font-bold">{step}</p>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-black text-emerald-600 uppercase tracking-widest text-[11px] mb-6">Para Empresas</h3>
            {[
              "Regista a tua organização com o NIF.",
              "Publica as tuas vagas com detalhes precisos.",
              "Recebe e analisa perfis e currículos reais.",
              "Gere os candidatos (Entrevista, Seleção, etc)."
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">{i+1}</div>
                <p className="text-slate-600 font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="py-24 px-4 bg-white border-t border-slate-200 text-center">
        <div className="max-w-2xl mx-auto bg-slate-950 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-black mb-6 tracking-tight relative z-10">Pronto para começar?</h2>
          <p className="text-slate-400 mb-10 font-medium relative z-10">Junta-te a milhares de cabo-verdianos que já estão a transformar as suas carreiras através do CVemprego.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link href="/register" className="bg-white text-slate-900 font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-lg">Criar Conta Grátis</Link>
            <Link href="/vagas" className="bg-white/10 text-white font-black uppercase text-xs tracking-widest px-8 py-4 rounded-2xl hover:bg-white/20 transition-all border border-white/10 active:scale-95">Explorar Vagas</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-slate-500 py-16 px-8 mt-auto border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Image src="/logo-cvemprego.png" alt="Logo" width={150} height={40} className="brightness-200 grayscale mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">O portal do trabalho em Cabo Verde</p>
            </div>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest">
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
              <Link href="/ajuda" className="hover:text-white transition-colors">Suporte</Link>
            </div>
            <p className="text-xs font-bold">© {new Date().getFullYear()} CVemprego · Trabalho Final de Curso</p>
        </div>
      </footer>
    </div>
  );
}