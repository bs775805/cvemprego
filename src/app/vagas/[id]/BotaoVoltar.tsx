// src/app/vagas/[id]/BotaoVoltar.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BotaoVoltar() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push("/candidato/candidaturas")} // Força a volta para as candidaturas
      className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
    >
      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar às minhas candidaturas
    </button>
  );
}