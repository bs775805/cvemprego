"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BotaoVoltarVaga() {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.back()} 
      className="mb-8 inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
    >
      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar atrás
    </button>
  );
}