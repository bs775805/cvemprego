// src/app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  Search, MapPin, Building2, Briefcase, 
  Monitor, Stethoscope, GraduationCap, 
  HardHat, ShoppingCart, Scale, BadgeCheck, Star,
  Fish, Plane, ChevronRight
} from "lucide-react";

// --- Dicionários para tradução de Enums ---
const ilhasMap: Record<string, string> = {
  SANTIAGO: "Santiago", SAO_VICENTE: "São Vicente", SAL: "Sal", 
  SANTO_ANTAO: "Santo Antão", FOGO: "Fogo", BOA_VISTA: "Boa Vista", 
  SAO_NICOLAU: "São Nicolau", BRAVA: "Brava", MAIO: "Maio",
};

const setoresUI = [
  { id: "TOURISM", name: "Turismo", icon: Plane, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "TECHNOLOGY", name: "Tecnologia", icon: Monitor, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "HEALTH", name: "Saúde", icon: Stethoscope, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "EDUCATION", name: "Educação", icon: GraduationCap, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: "FISHING", name: "Pescas", icon: Fish, color: "text-cyan-500", bg: "bg-cyan-50" },
  { id: "CONSTRUCTION", name: "Construção", icon: HardHat, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "COMMERCE", name: "Comércio", icon: ShoppingCart, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "SERVICES", name: "Serviços", icon: Scale, color: "text-purple-500", bg: "bg-purple-50" },
];

export default async function HomePage() {
  // 1. BUscar Dados Reais do Banco (Métricas e Vagas)
  const [totalCandidatos, totalEmpresas, totalVagas, vagasEmDestaque] = await Promise.all([
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.jobListing.count({ where: { status: "ACTIVE" } }),
    prisma.jobListing.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: { company: true },
      orderBy: { publishedAt: 'desc' },
      take: 3
    })
  ]);

  // Contagem de vagas por sector para os cards
  const jobCounts = await prisma.jobListing.groupBy({
    by: ['sector'],
    where: { status: "ACTIVE" },
    _count: { _all: true }
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col text-slate-900">
      
      {/* 1. NAVBAR / HEADER */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo-cvemprego.png" 
            alt="CVemprego Logo" 
            width={220}
            height={70} 
            className="h-14 w-auto object-contain py-1"
            priority
          />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <Link href="/" className="text-blue-700">Início</Link>
          <Link href="/vagas" className="hover:text-blue-700 transition-colors">Vagas</Link>
          <Link href="/empresas" className="hover:text-blue-700 transition-colors">Empresas</Link>
          <Link href="/sobre" className="hover:text-blue-700 transition-colors">Sobre</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-blue-700">
            Entrar
          </Link>
          <Link href="/register" className="text-sm font-black bg-blue-700 text-white px-6 py-2.5 rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-100">
            Criar Conta
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-[#0b2853] pt-24 pb-32 px-4 flex flex-col items-center text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
            <span>✨</span> PLATAFORMA Nº1 DE EMPREGO EM CABO VERDE
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
            Encontra o teu emprego <br className="hidden md:block" />
            nas <span className="text-blue-400 italic">9 ilhas</span> de Cabo Verde
          </h1>
          
          <p className="text-lg text-blue-100/80 mb-12 max-w-2xl font-medium">
            Conectamos talentos cabo-verdianos com as melhores empresas nacionais. Simples, rápido e 100% local.
          </p>

          {/* Search Bar Form */}
          <form action="/vagas" method="GET" className="w-full max-w-3xl bg-white rounded-[32px] p-2 flex flex-col md:flex-row items-center shadow-2xl shadow-black/20">
            <div className="flex-1 flex items-center px-6 w-full border-b md:border-b-0 md:border-r border-slate-100 py-3 md:py-0">
              <Search className="text-blue-600 w-5 h-5 mr-4" />
              <input 
                name="q"
                type="text" 
                placeholder="Função, empresa ou palavra-chave" 
                className="w-full bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
            <div className="w-full md:w-56 flex items-center px-6 py-3 md:py-0 relative">
              <MapPin className="text-blue-600 w-5 h-5 mr-4" />
              <select name="island" className="w-full bg-transparent border-none focus:outline-none text-slate-600 font-bold text-sm cursor-pointer appearance-none">
                <option value="">Todas as ilhas</option>
                {Object.entries(ilhasMap).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-[24px] font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-700/30">
              Pesquisar
            </button>
          </form>

          {/* Stats Reais */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 mt-20 text-white">
            <div className="flex flex-col items-center">
                <span className="text-4xl font-black">{totalCandidatos.toLocaleString()}</span>
                <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-2">Candidatos</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-4xl font-black">{totalEmpresas.toLocaleString()}</span>
                <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-2">Empresas</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-4xl font-black">{totalVagas.toLocaleString()}</span>
                <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-2">Vagas Activas</span>
            </div>
            <div className="hidden md:flex flex-col items-center">
                <span className="text-4xl font-black">9</span>
                <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest mt-2">Ilhas</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#f8fafc]"></path>
          </svg>
        </div>
      </section>

      {/* 3. EXPLORAR POR SECTOR */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Explorar por sector</h2>
          <p className="text-slate-500 font-medium">Oportunidades reais nas tuas áreas de especialização</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {setoresUI.map((sector, i) => {
            const count = jobCounts.find(c => c.sector === sector.id)?._count._all || 0;
            return (
                <Link href={`/vagas?sector=${sector.id}`} key={i} className="flex flex-col items-center justify-center p-8 bg-white rounded-[40px] border border-slate-200 hover:border-blue-500 hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
                  <div className={`p-5 rounded-[24px] ${sector.bg} mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                    <sector.icon className={`w-10 h-10 ${sector.color}`} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{sector.name}</h3>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{count} {count === 1 ? 'vaga' : 'vagas'}</p>
                </Link>
            );
          })}
        </div>
      </section>

      {/* 4. VAGAS EM DESTAQUE REAIS */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Vagas em destaque</h2>
                <p className="text-slate-500 font-medium text-lg italic underline decoration-blue-100 underline-offset-4">Oportunidades seleccionadas pela nossa equipa</p>
              </div>
              <Link href="/vagas" className="hidden md:flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-700 transition-colors">
                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              {vagasEmDestaque.length === 0 ? (
                  <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[40px] text-slate-400 font-bold">Ainda não existem vagas em destaque hoje.</div>
              ) : vagasEmDestaque.map((vaga) => (
                <Link key={vaga.id} href={`/vagas/${vaga.id}`} className="group block bg-white border-2 border-amber-400 rounded-[32px] p-8 hover:shadow-2xl transition-all relative overflow-hidden shadow-xl shadow-amber-50">
                  <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-bl-[20px] flex items-center gap-1.5 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-white" /> Vaga em Destaque
                  </div>
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-[24px] flex items-center justify-center flex-shrink-0 border border-amber-100 shadow-inner">
                      <span className="font-black text-amber-600 text-3xl">{vaga.company.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-tight mb-2 tracking-tight">{vaga.title}</h3>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-slate-600">{vaga.company.name}</span>
                              {vaga.company.isVerified && (
                                <span className="flex items-center text-[10px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-black uppercase tracking-tighter">
                                  <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Verificado
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 text-left md:text-right">
                            <p className="text-xl font-black text-slate-900">{vaga.salaryMin ? `${vaga.salaryMin/1000}k` : "A combinar"} <span className="text-xs font-bold text-slate-400">ECV/mês</span></p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Destaque Activo</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-blue-50 text-blue-700 border border-blue-100">📍 {ilhasMap[vaga.island]}</span>
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-700 border border-emerald-100">💼 Efectivo</span>
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 border border-slate-200">Experiência: {vaga.experienceLevel}</span>
                        </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      </section>

      {/* 5. CTA CARDS */}
      <section className="py-24 px-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0b2853] rounded-[48px] p-12 flex flex-col items-start relative overflow-hidden group shadow-2xl shadow-blue-900/20">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="p-4 bg-white/10 rounded-2xl mb-8 backdrop-blur-sm border border-white/10">
              <Briefcase className="w-10 h-10 text-blue-300" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 relative z-10 tracking-tight">És candidato?</h3>
            <p className="text-blue-100/70 text-base mb-10 leading-relaxed relative z-10 font-medium">
              Cria o teu perfil profissional, carrega o teu CV e recebe alertas de novas vagas em tempo real.
            </p>
            <Link href="/register" className="mt-auto bg-white hover:bg-slate-100 text-[#0b2853] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl transition-all relative z-10 shadow-xl active:scale-95">
              Criar Perfil Grátis
            </Link>
          </div>

          <div className="bg-blue-600 rounded-[48px] p-12 flex flex-col items-start relative overflow-hidden group shadow-2xl shadow-blue-600/20">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="p-4 bg-white/20 rounded-2xl mb-8 backdrop-blur-sm border border-white/10">
              <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 relative z-10 tracking-tight">Tens uma empresa?</h3>
            <p className="text-white/80 text-base mb-10 leading-relaxed relative z-10 font-medium">
              Encontra os melhores profissionais em Cabo Verde. Publica a tua vaga e gere candidaturas com facilidade.
            </p>
            <Link href="/register" className="mt-auto bg-white hover:bg-slate-100 text-blue-700 font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl transition-all relative z-10 shadow-xl active:scale-95">
              Publicar Vaga
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f172a] text-slate-500 py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col items-center md:items-start">
              <Image src="/logo-cvemprego.png" alt="Logo" width={150} height={40} className="brightness-200 grayscale mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">O teu futuro começa aqui</p>
            </div>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest">
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="/ajuda" className="hover:text-white transition-colors">Ajuda</Link>
            </div>
            <p className="text-xs font-bold">© {new Date().getFullYear()} CVemprego · TFC Bruno Santos</p>
        </div>
      </footer>
    </div>
  );
}