// src/app/empresa/vagas/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface VagaFormData {
  title: string; contractType: string; island: string; sector: string;
  experienceLevel: string; salaryMin: string; salaryMax: string; description: string;
}

// Interface para remover o any
interface VagaDaApi {
  id: string;
  title: string;
  contractType: string;
  island: string;
  sector: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
}

export default function EditarVagaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<VagaFormData>();

  // Ir buscar a vaga
  useEffect(() => {
    fetch(`/api/vagas`) 
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          // Substituímos o any por VagaDaApi
          const vaga = json.data.find((v: VagaDaApi) => v.id === params.id);
          if (vaga) {
            reset({
              title: vaga.title,
              contractType: vaga.contractType,
              island: vaga.island,
              sector: vaga.sector,
              experienceLevel: vaga.experienceLevel,
              salaryMin: vaga.salaryMin ? vaga.salaryMin.toString() : "",
              salaryMax: vaga.salaryMax ? vaga.salaryMax.toString() : "",
              description: vaga.description,
            });
            setLoading(false);
          }
        }
      });
  }, [params.id, reset]);

  const onSubmit = async (data: VagaFormData) => {
    setErrorMsg("");
    try {
      const res = await fetch(`/api/empresa/vagas/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();
      setSuccessMsg("Vaga atualizada com sucesso!");
      setTimeout(() => router.push("/empresa/vagas"), 1500);
    } catch {
      setErrorMsg("Erro ao processar a atualização.");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-12 font-sans">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/empresa/vagas" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"><ArrowLeft className="w-5 h-5 text-slate-500" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Vaga</h1>
          <p className="text-sm text-slate-500">Altera os dados do teu anúncio.</p>
        </div>
      </div>

      {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{errorMsg}</div>}
      {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">{successMsg}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Título da vaga</label>
            <input {...register("title", { required: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de contrato</label>
              <select {...register("contractType")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"><option value="PERMANENT">Efectivo</option><option value="TEMPORARY">Temporário</option><option value="INTERNSHIP">Estágio</option></select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ilha</label>
              <select {...register("island")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"><option value="SANTIAGO">Santiago</option><option value="SAL">Sal</option><option value="SAO_VICENTE">São Vicente</option></select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descrição da vaga</label>
            <textarea {...register("description")} rows={6} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-blue-500"></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-3 rounded-xl font-bold transition-all flex items-center">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Guardar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}