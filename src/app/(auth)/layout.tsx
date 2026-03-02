import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar simplificada para manter o contexto visual */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">CV<span className="text-blue-700">emprego</span></span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Cabo Verde</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="text-blue-700">Início</Link>
          <Link href="/vagas" className="hover:text-blue-700">Vagas</Link>
          <Link href="/empresas" className="hover:text-blue-700">Empresas</Link>
          <Link href="/sobre" className="hover:text-blue-700">Sobre</Link>
        </div>
      </header>

      {/* Área onde entram as páginas de login e registo */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}