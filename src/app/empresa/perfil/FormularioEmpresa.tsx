// src/app/empresa/perfil/FormularioEmpresa.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Camera } from "lucide-react";
import Image from "next/image"; // 1. Importamos o componente Image

interface CompanyData {
  name: string;
  nif: string | null;
  island: string;
  sector: string;
  size: string;
  website: string | null;
  description: string | null;
  logoUrl?: string | null;
}

export default function FormularioEmpresa({ company }: { company: CompanyData }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit } = useForm<CompanyData>({
    defaultValues: company
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
      if (res.ok) {
        setMessage("Logótipo actualizado com sucesso! ✨");
        window.location.reload(); 
      }
    } catch {
      alert("Erro ao carregar ficheiro.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CompanyData) => {
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/empresa/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setMessage("Perfil actualizado com sucesso! ✨");
    } catch { setMessage("Erro ao guardar."); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-20 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Perfil da empresa</h1>
        <button type="submit" disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-md">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar alterações"}
        </button>
      </div>

      {message && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-sm font-medium">{message}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center shadow-sm">
        
        {/* LOGÓTIPO COM NEXT/IMAGE */}
        <div className="relative group">
          <div className="w-32 h-32 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center text-4xl font-black text-blue-700 overflow-hidden shadow-inner relative">
             {company.logoUrl ? (
               <Image 
                 src={`https://pub-cc443c3ffe6e43e581c3431029871225.r2.dev/${company.logoUrl}`} 
                 alt="Logótipo da Empresa" 
                 fill // Faz a imagem ocupar o container
                 className="object-cover"
                 sizes="128px"
               />
             ) : company.name.charAt(0).toUpperCase()}
          </div>
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2.5 bg-white border border-slate-200 rounded-full shadow-xl hover:bg-blue-50 transition-all group-hover:scale-110 z-10"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : <Camera className="w-5 h-5 text-blue-600" />}
          </button>
          
          <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase mt-6 tracking-widest">Carregar Logótipo</p>

        <div className="w-full mt-12 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome da empresa</label>
            <input {...register("name")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NIF</label>
              <input {...register("nif")} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ilha sede</label>
              <select {...register("island")} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none appearance-none cursor-pointer">
                <option value="SANTIAGO">Santiago</option>
                <option value="SAO_VICENTE">São Vicente</option>
                <option value="SAL">Sal</option>
                <option value="BOA_VISTA">Boa Vista</option>
                <option value="FOGO">Fogo</option>
                <option value="SANTO_ANTAO">Santo Antão</option>
                <option value="SAO_NICOLAU">São Nicolau</option>
                <option value="BRAVA">Brava</option>
                <option value="MAIO">Maio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">História da empresa</label>
            <textarea {...register("description")} rows={5} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-blue-500"></textarea>
          </div>
        </div>
      </div>
    </form>
  );
}