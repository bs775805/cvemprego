// src/app/vagas/[id]/candidatar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, FileText, Check, Info, Loader2 
} from "lucide-react";

export default function CandidatarPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [mensagem, setMensagem] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Estado para simular o carregamento dos dados da vaga no cabeçalho
  const [jobTitle, setJobTitle] = useState("A carregar vaga...");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    // Busca rápida só para preencher o cabeçalho
    fetch(`/api/vagas`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
            const vaga = json.data.find((v: { id: string; title: string; company: { name: string } }) => v.id === params.id);          if (vaga) {
            setJobTitle(vaga.title);
            setCompanyName(vaga.company.name);
          }
        }
      });
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = async () => {
    if (!file) {
      setErrorMsg("Por favor, faz upload de um CV em PDF.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/candidaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: params.id,
          coverMessage: mensagem,
          cvFileName: file.name
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Erro ao submeter candidatura.");

      setSuccessMsg("Candidatura enviada com sucesso! Boa sorte! 🎉");
      
      // Espera 2 segundos e redireciona para o painel do candidato
      setTimeout(() => {
        router.push("/candidato/dashboard");
      }, 2000);

    } catch (error) {
      if (error instanceof Error) setErrorMsg(error.message);
      else setErrorMsg("Ocorreu um erro desconhecido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center py-12 px-4">
      
      <div className="w-full max-w-2xl">
        
        {/* Voltar */}
        <div className="mb-6">
          <Link href={`/vagas/${params.id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à vaga
          </Link>
        </div>

        {/* Header da Vaga (Resumo) */}
        <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-sm">
            <span className="font-bold text-blue-700 text-xl">{companyName ? companyName.charAt(0) : "H"}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{jobTitle}</h2>
            <p className="text-sm text-slate-500">{companyName || "Empresa"}</p>
          </div>
        </div>

        {/* Formulário de Candidatura */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-8">Submeter candidatura</h1>

          {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{errorMsg}</div>}
          {successMsg && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200 font-medium">{successMsg}</div>}

          {/* Upload CV */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-3">CV / Currículo <span className="text-red-500">*</span></label>
            
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Clica para fazer upload do teu CV</p>
                  <p className="text-xs text-slate-400 mt-1">PDF apenas • Máximo 5MB</p>
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-emerald-800">
                  <span className="font-bold">{file.name}</span> — CV anexado com sucesso.
                </p>
                <button onClick={() => setFile(null)} className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline">
                  Alterar
                </button>
              </div>
            )}
          </div>

          {/* Mensagem Opcional */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-3">Mensagem de candidatura <span className="text-slate-400 font-normal">(opcional)</span></label>
            <textarea 
              rows={4}
              maxLength={500}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Apresenta-te brevemente e explica porque és o candidato ideal para esta vaga..." 
              className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
            ></textarea>
            <p className="text-xs text-slate-400 mt-2 text-right">{mensagem.length} / 500 caracteres</p>
          </div>

          {/* Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 mb-8">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-relaxed">
              O teu perfil e dados pessoais serão partilhados com a empresa. Podes ver o estado da candidatura no teu painel.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            onClick={onSubmit}
            disabled={isSubmitting || successMsg !== ""}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> A enviar candidatura...</>
            ) : (
              "Enviar candidatura →"
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
}