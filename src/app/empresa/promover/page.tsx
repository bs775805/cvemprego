// src/app/empresa/promover/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Star, Check, Copy, Loader2, CreditCard, Info } from "lucide-react";

// --- 1. Interfaces para Tipagem Segura ---
interface VagaSimples {
  id: string;
  title: string;
  status: string;
}

interface CheckoutData {
  reference: string;
  amount: number;
}

interface ApiResponse {
  success: boolean;
  data: VagaSimples[];
}

export default function PromoverVagaPage() {
  const [vagas, setVagas] = useState<VagaSimples[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  // 2. Carregar apenas as vagas activas da empresa
  useEffect(() => {
    fetch("/api/empresa/minhas-vagas")
      .then((res) => res.json())
      .then((json: ApiResponse) => {
        if (json.success) {
          // Filtramos apenas as vagas que estão ACTIVE na base de dados
          const activas = json.data.filter((v: VagaSimples) => v.status === "ACTIVE");
          setVagas(activas);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 3. Função para solicitar a referência de pagamento
  const handleSolicitar = async () => {
    if (!selectedJobId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/empresa/pagamentos/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId }),
      });
      const json = await res.json();
      if (json.success) {
        setCheckoutData({
          reference: json.reference,
          amount: json.amount
        });
      } else {
        alert(json.message || "Erro ao gerar referência.");
      }
    } catch {
      alert("Erro de ligação ao servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const copiarReferencia = () => {
    if (checkoutData) {
      navigator.clipboard.writeText(checkoutData.reference);
      alert("Referência copiada!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">A carregar os teus anúncios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-sans pb-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Promover Vaga</h1>
        <p className="text-slate-500 font-medium">Lidera as pesquisas e atrai os melhores talentos de Cabo Verde</p>
      </div>

      {!checkoutData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* LADO ESQUERDO: SELECÇÃO DO PLANO */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-1">1. Seleccionar Anúncio</label>
              <select 
                value={selectedJobId} 
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[20px] text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">Escolhe uma vaga activa...</option>
                {vagas.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
              </select>
            </div>

            <div className="p-8 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
              {/* Círculo decorativo */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 fill-white" /> Plano de Destaque
              </h3>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm font-bold opacity-90"><Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" /> Aparece no topo da lista</li>
                <li className="flex items-center gap-3 text-sm font-bold opacity-90"><Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" /> Moldura dourada exclusiva</li>
                <li className="flex items-center gap-3 text-sm font-bold opacity-90"><Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" /> Duração de 7 dias</li>
              </ul>

              <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Preço Único</span>
                <span className="text-3xl font-black">800 ECV</span>
              </div>
            </div>

            <button 
              onClick={handleSolicitar}
              disabled={!selectedJobId || submitting}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
            >
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Gerar Referência"}
            </button>
          </div>

          {/* LADO DIREITO: INSTRUÇÕES */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                 <CreditCard className="text-blue-600 w-6 h-6" />
               </div>
               <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight">Como funciona?</h2>
               <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
                 Para manter o portal seguro, validamos todos os pagamentos manualmente através de transferência bancária.
               </p>
               
               <div className="space-y-6">
                 {[
                   { step: "1", text: "Geras a referência única para a vaga pretendida." },
                   { step: "2", text: "Efectuas a transferência para o NIB indicado." },
                   { step: "3", text: "O nosso Admin confirma e a vaga sobe ao topo!" },
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-start gap-4">
                     <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{item.step}</div>
                     <p className="text-sm font-bold text-slate-700">{item.text}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      ) : (
        /* ECRÃ DE SUCESSO E INFORMAÇÕES DE PAGAMENTO */
        <div className="max-w-2xl mx-auto bg-white rounded-[48px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in duration-500 font-sans">
           <div className="bg-emerald-600 p-12 text-white text-center relative overflow-hidden">
             {/* Decoração de fundo */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
             
             <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner border border-white/30">
               <Check className="w-10 h-10" strokeWidth={3} />
             </div>
             <h2 className="text-3xl font-black tracking-tight">Referência Gerada!</h2>
             <p className="opacity-90 text-[10px] mt-2 uppercase font-black tracking-[0.3em]">Aguardando Transferência</p>
           </div>
           
           <div className="p-12 space-y-10">
             <div className="text-center space-y-3">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Usa esta referência no descritivo:</p>
                <div className="inline-flex items-center gap-4 bg-slate-50 px-8 py-5 rounded-[24px] border-2 border-slate-100 shadow-inner group">
                  <span className="text-3xl font-black text-slate-900 tracking-[0.1em]">{checkoutData.reference}</span>
                  <button onClick={copiarReferencia} className="p-2.5 bg-white hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm text-slate-400 group-hover:scale-110">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
             </div>

             <div className="bg-[#f8fafc] rounded-[32px] p-8 border border-slate-200/50 space-y-6">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wider">
                  <Info className="w-4 h-4 text-blue-600" /> Dados para Pagamento
                </h3>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Banco</p>
                     <p className="font-bold text-slate-700">Banco de Cabo Verde</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Titular</p>
                     <p className="font-bold text-slate-700 uppercase">CVEMPREGO LDA</p>
                   </div>
                   <div className="col-span-2 p-4 bg-white rounded-2xl border border-slate-200">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-2">NIB / IBAN</p>
                     <p className="font-mono font-black text-slate-900 text-xl tracking-tighter">CV63 0000 1234 5678 9012 3</p>
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-4">
               <button 
                 onClick={() => window.location.reload()} 
                 className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs"
               >
                 Entendido, já fiz a transferência
               </button>
               <p className="text-center text-[10px] text-slate-400 font-bold leading-relaxed px-8">
                 O destaque ficará activo no site em menos de 24 horas úteis após a verificação pelo nosso sistema.
               </p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}