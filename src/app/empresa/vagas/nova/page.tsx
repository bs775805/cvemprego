// src/app/empresa/vagas/nova/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";
import Link from "next/link";

interface VagaFormData {
  title: string;
  contractType: string;
  island: string;
  sector: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  deadline: string;
  description: string;
}

export default function NovaVagaPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<VagaFormData>();

  const onSubmit = async (data: VagaFormData) => {
    setErrorMsg("");
    if (data.salaryMin && data.salaryMax && parseInt(data.salaryMin) > parseInt(data.salaryMax)) {
      setErrorMsg("O salário mínimo não pode ser maior que o máximo.");
      return;
    }

    try {
      const res = await fetch("/api/vagas/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();
      setSuccessMsg("Vaga publicada com sucesso!");
      setTimeout(() => router.push("/empresa/vagas"), 2000);
    } catch {
      setErrorMsg("Erro ao processar o pedido.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-12 font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Publicar nova vaga</h1>
          <Link href="/empresa/vagas" className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </Link>
        </div>

        {errorMsg && <div className="mx-8 mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{errorMsg}</div>}
        {successMsg && <div className="mx-8 mt-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">{successMsg}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Título da vaga *</label>
            <input {...register("title", { required: true })} type="text" placeholder="ex: Recepcionista Bilingue" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de contrato</label>
              <select {...register("contractType")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                <option value="PERMANENT">Efectivo</option>
                <option value="TEMPORARY">Temporário</option>
                <option value="INTERNSHIP">Estágio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ilha</label>
              <select {...register("island")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                <option value="SANTIAGO">Santiago</option>
                <option value="SAO_VICENTE">São Vicente</option>
                <option value="SAL">Sal</option>
                <option value="SANTO_ANTAO">Santo Antão</option>
                <option value="FOGO">Fogo</option>
                <option value="BOA_VISTA">Boa Vista</option>
                <option value="SAO_NICOLAU">São Nicolau</option>
                <option value="BRAVA">Brava</option>
                <option value="MAIO">Maio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sector</label>
              <select {...register("sector")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                <option value="TOURISM">Turismo & Hotelaria</option>
                <option value="TECHNOLOGY">Tecnologia & TI</option>
                <option value="HEALTH">Saúde</option>
                <option value="EDUCATION">Educação</option>
                <option value="FISHING">Pescas</option>
                <option value="CONSTRUCTION">Construção & Imobiliário</option>
                <option value="COMMERCE">Comércio & Retalho</option>
                <option value="SERVICES">Serviços</option>
                <option value="AGRICULTURE">Agricultura</option>
                <option value="FINANCE">Finanças & Banca</option>
                <option value="OTHER">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nível de experiência</label>
              <select {...register("experienceLevel")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none">
                <option value="NO_EXPERIENCE">Sem experiência</option>
                <option value="JUNIOR">Júnior (1-2 anos)</option>
                <option value="MID">Médio (3-5 anos)</option>
                <option value="SENIOR">Sénior (5+ anos)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Salário mín. (ECV)</label>
              <input {...register("salaryMin")} type="number" placeholder="Ex: 35000" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Salário máx. (ECV)</label>
              <input {...register("salaryMax")} type="number" placeholder="Ex: 50000" className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Descrição *</label>
            <textarea {...register("description", { required: true })} rows={6} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-blue-500" placeholder="Responsabilidades, requisitos e o que oferecem..."></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-blue-700 hover:bg-blue-800 text-white px-10 py-3 rounded-xl font-bold transition-all flex items-center shadow-lg shadow-blue-100">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Publicar vaga →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}