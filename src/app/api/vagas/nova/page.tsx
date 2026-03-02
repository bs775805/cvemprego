// src/app/empresa/vagas/nova/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NovaVagaPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: Record<string, unknown>) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/vagas/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Erro ao publicar a vaga. Tenta novamente.");

      setSuccessMsg("Vaga publicada com sucesso! A redirecionar...");
      setTimeout(() => router.push("/empresa/dashboard"), 2000);
     } catch (error) {
      if (error instanceof Error) setErrorMsg(error.message);
      else setErrorMsg("Ocorreu um erro desconhecido.");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/empresa/dashboard" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Publicar Nova Vaga</h1>
          <p className="text-sm text-slate-500">Preenche os detalhes para encontrar o candidato ideal.</p>
        </div>
      </div>

      {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{errorMsg}</div>}
      {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200 font-medium">{successMsg}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Informação Principal */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Detalhes da Vaga</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título da Vaga *</label>
            <input {...register("title", { required: true })} type="text" placeholder="Ex: Engenheiro Informático" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sector *</label>
              <select {...register("sector", { required: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="TECHNOLOGY">Tecnologia & TI</option>
                <option value="TOURISM">Turismo & Hotelaria</option>
                <option value="HEALTH">Saúde</option>
                <option value="COMMERCE">Comércio</option>
                <option value="CONSTRUCTION">Construção</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ilha *</label>
              <select {...register("island", { required: true })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="SANTIAGO">Santiago</option>
                <option value="SAO_VICENTE">São Vicente</option>
                <option value="SAL">Sal</option>
                <option value="BOA_VISTA">Boa Vista</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tipos e Contratos */}
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Trabalho *</label>
              <select {...register("jobType")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option value="FULL_TIME">Tempo Inteiro</option>
                <option value="PART_TIME">Tempo Parcial</option>
                <option value="INTERNSHIP">Estágio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contrato *</label>
              <select {...register("contractType")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option value="PERMANENT">Efectivo</option>
                <option value="TEMPORARY">Temporário</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experiência *</label>
              <select {...register("experienceLevel")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                <option value="NO_EXPERIENCE">Sem Experiência</option>
                <option value="JUNIOR">Júnior (1-2 anos)</option>
                <option value="MID">Pleno (3-5 anos)</option>
                <option value="SENIOR">Sénior (5+ anos)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Textos Longos */}
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição da Vaga *</label>
            <textarea {...register("description", { required: true })} rows={4} placeholder="Descreve o que o candidato vai fazer..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requisitos (Opcional)</label>
            <textarea {...register("requirements")} rows={3} placeholder="O que o candidato precisa ter..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"></textarea>
          </div>
        </div>

        {/* Salário */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Salário Mensal (ECV)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mínimo (Opcional)</label>
              <input {...register("salaryMin")} type="number" placeholder="Ex: 40000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Máximo (Opcional)</label>
              <input {...register("salaryMax")} type="number" placeholder="Ex: 60000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <Link href="/empresa/dashboard" className="px-6 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</Link>
          <button type="submit" disabled={isSubmitting} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center">
            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publicando...</> : "Publicar Vaga Agora"}
          </button>
        </div>
      </form>
    </div>
  );
}