// src/app/candidato/perfil/FormularioPerfil.tsx
"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, CheckCircle2, Circle, Plus, Trash2, FileText, Upload } from "lucide-react";

// 1. Interfaces rigorosas para o TypeScript
interface ExperienceItem {
  id?: string;
  company: string;
  title: string;
  description: string | null;
}

interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string | null;
  island: string;
  preferredSector: string | null;
  bio: string | null;
  cvUrl: string | null;
  experience: ExperienceItem[];
  education: EducationItem[];
}

interface ProfileProps {
  profile: ProfileData;
  email: string;
}

export default function FormularioPerfil({ profile, email }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Configuração do Formulário
  const { register, handleSubmit, control, watch } = useForm<ProfileData>({
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phone: profile.phone || "",
      island: profile.island || "SANTIAGO",
      preferredSector: profile.preferredSector || "TOURISM",
      bio: profile.bio || "",
      experience: profile.experience || [],
      education: profile.education || [],
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: "experience"
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control,
    name: "education"
  });

  const watchers = watch();
  
  const calcularCompletude = () => {
    let pontos = 0;
    if (watchers.firstName && watchers.lastName) pontos += 25;
    if (profile.cvUrl) pontos += 25;
    if (watchers.preferredSector) pontos += 25;
    if (watchers.experience && watchers.experience.length > 0) pontos += 12.5;
    if (watchers.education && watchers.education.length > 0) pontos += 12.5;
    return pontos;
  };

  // 3. Lógica de UPLOAD REAL para Cloudflare R2
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, carrega apenas ficheiros PDF.");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/cv", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage("CV enviado com sucesso! ☁️");
        window.location.reload(); 
      } else {
        setMessage("Falha ao enviar ficheiro para a nuvem.");
      }
    } catch {
      setMessage("Erro na ligação ao servidor de ficheiros.");
    } finally {
      setUploading(false);
    }
  };

  // 4. Lógica de GUARDAR DADOS (PATCH)
  const onSubmit = async (data: ProfileData) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/candidato/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage("Perfil actualizado com sucesso!");
      } else {
        setMessage("Erro ao guardar dados.");
      }
    } catch {
      setMessage("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">O meu perfil</h1>
          <p className="text-sm text-slate-500">As empresas vêem estas informações</p>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar alterações
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${message.includes("sucesso") ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECÇÃO 1: DADOS PESSOAIS */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Dados Pessoais</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Nome</label><input {...register("firstName")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Apelido</label><input {...register("lastName")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Email</label><input value={email} disabled className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400" /></div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Telefone</label><input {...register("phone")} placeholder="+238 9XX XXX XXX" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Ilha</label><select {...register("island")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"><option value="SANTIAGO">Santiago</option><option value="SAO_VICENTE">São Vicente</option><option value="SAL">Sal</option><option value="BOA_VISTA">Boa Vista</option></select></div>
              <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Área de Interesse</label><select {...register("preferredSector")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"><option value="TOURISM">Turismo</option><option value="TECHNOLOGY">Tecnologia</option><option value="HEALTH">Saúde</option></select></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-700">Sobre mim</label><textarea {...register("bio")} rows={4} placeholder="Breve apresentação profissional..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none"></textarea></div>
          </div>

          {/* SECÇÃO 2: EXPERIÊNCIA PROFISSIONAL */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Experiência Profissional</h2>
              <button type="button" onClick={() => appendExp({ company: "", title: "", description: "" })} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Adicionar</button>
            </div>
            {expFields.map((field, index) => (
              <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                <button type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input {...register(`experience.${index}.company`)} placeholder="Empresa" className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                  <input {...register(`experience.${index}.title`)} placeholder="Cargo" className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                </div>
                <textarea {...register(`experience.${index}.description`)} placeholder="O que fazias lá..." className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none resize-none" rows={2}></textarea>
              </div>
            ))}
          </div>

          {/* SECÇÃO 3: FORMAÇÃO ACADÉMICA */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Formação Académica</h2>
              <button type="button" onClick={() => appendEdu({ institution: "", degree: "" })} className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Adicionar</button>
            </div>
            {eduFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                <input {...register(`education.${index}.institution`)} placeholder="Escola / Universidade" className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                <input {...register(`education.${index}.degree`)} placeholder="Grau" className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none" />
                <button type="button" onClick={() => removeEdu(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>

          {/* SECÇÃO 4: CV / UPLOAD REAL */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">CV / Currículo</h2>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
            {profile.cvUrl ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                <FileText className="text-emerald-500 w-5 h-5" />
                <div className="flex flex-col"><span className="text-sm text-emerald-800 font-medium">CV activo</span><span className="text-[10px] text-emerald-600 font-bold">GUARDADO NO R2</span></div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3"><Circle className="text-amber-500 w-5 h-5" /><span className="text-sm text-amber-800">Sem currículo carregado</span></div>
            )}
            <div onClick={() => !uploading && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${uploading ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}`}>
              <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                {uploading ? <Loader2 className="w-6 h-6 text-blue-600 animate-spin" /> : <Upload className="w-6 h-6 text-blue-600" />}
              </div>
              <span className="text-sm font-bold text-slate-700">{uploading ? "A carregar PDF..." : "Actualizar CV agora"}</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Completude */}
        <div className="space-y-6 sticky top-24 h-fit">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Completude</h3>
            <div className="flex items-end gap-2 mb-2"><span className="text-3xl font-black text-blue-700">{calcularCompletude()}%</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full mb-6"><div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${calcularCompletude()}%` }}></div></div>
            <div className="space-y-3">
              <StatusItem label="Dados pessoais" done={!!watchers.firstName} />
              <StatusItem label="CV enviado" done={!!profile.cvUrl} />
              <StatusItem label="Área de interesse" done={!!watchers.preferredSector} />
              <StatusItem label="Experiência" done={watchers.experience.length > 0} />
              <StatusItem label="Formação" done={watchers.education.length > 0} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function StatusItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium ${done ? 'text-emerald-600' : 'text-slate-400'}`}>
      {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      {label}
    </div>
  );
}