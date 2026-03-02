// src/app/vagas/[id]/BotoesInterativosVaga.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Check } from "lucide-react";

interface Props {
  jobId: string;
  initialSaved: boolean;
  hasApplied: boolean;
}

export default function BotoesInterativosVaga({ jobId, initialSaved, hasApplied }: Props) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candidato/guardar-vaga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      
      if (res.status === 401) {
        alert("Precisas de estar logado como candidato.");
        router.push("/login");
        return;
      }

      const json = await res.json();
      if (json.success) setIsSaved(json.saved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {hasApplied ? (
        <button disabled className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold py-3.5 rounded-xl flex items-center justify-center cursor-not-allowed">
          <Check className="w-5 h-5 mr-2" /> Candidatura enviada
        </button>
      ) : (
        <button 
          onClick={() => router.push(`/vagas/${jobId}/candidatar`)}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
        >
          Candidatar-me agora
        </button>
      )}

      <button 
        onClick={handleSave}
        disabled={loading}
        className={`w-full font-bold py-3 rounded-xl transition-all border flex items-center justify-center gap-2 ${
          isSaved 
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-600 text-red-600' : 'text-slate-400'}`} />
        )}
        {isSaved ? "Vaga guardada" : "Guardar vaga"}
      </button>
    </div>
  );
}