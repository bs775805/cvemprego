// src/app/admin/pagamentos/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";

// --- 1. Interfaces ---
interface Pagamento {
  id: string;
  reference: string;
  amount: number;
  status: string;
  createdAt: string;
  company: { name: string };
  job?: { title: string } | null;
}

export default function AdminPagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // --- 2. Lógica de Carregamento ---
  const carregarPagamentos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pagamentos");
      const json = await res.json();
      if (json.success) {
        setPagamentos(json.data);
      }
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarPagamentos();
  }, [carregarPagamentos]);

  // --- 3. Lógica de Confirmação ---
  const handleConfirmar = async (id: string) => {
    if (!confirm("Confirmas que o valor desta transferência já entrou na conta bancária?")) return;

    setConfirmingId(id);
    try {
      const res = await fetch(`/api/admin/pagamentos/${id}/confirmar`, {
        method: "PATCH",
      });

      if (res.ok) {
        alert("Pagamento confirmado! A vaga foi destacada.");
        carregarPagamentos(); // Recarrega a lista
      } else {
        alert("Erro ao confirmar o pagamento.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto font-sans pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Gestão de Pagamentos</h1>
        <p className="text-slate-500 font-medium">Validação manual de transferências para activação de destaques</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Referência / Data</th>
              <th className="px-8 py-5">Empresa / Vaga</th>
              <th className="px-8 py-5 text-center">Valor</th>
              <th className="px-8 py-5 text-center">Estado</th>
              <th className="px-8 py-5 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 opacity-20" />
                </td>
              </tr>
            ) : pagamentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">
                  Não existem pedidos de pagamento registados no sistema.
                </td>
              </tr>
            ) : (
              pagamentos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-blue-600 tracking-wider text-sm">{p.reference}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                      {new Date(p.createdAt).toLocaleDateString('pt-PT')}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 leading-tight mb-1">{p.company.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Vaga: {p.job?.title || "N/A"}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-slate-900 text-base">
                    {p.amount} <span className="text-[10px] text-slate-400 ml-0.5">ECV</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      p.status === 'PENDING' 
                      ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {p.status === 'PENDING' ? 'Aguardando' : 'Confirmado'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {p.status === 'PENDING' && (
                      <button 
                        onClick={() => handleConfirmar(p.id)}
                        disabled={confirmingId === p.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2 ml-auto"
                      >
                        {confirmingId === p.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        )}
                        Confirmar
                      </button>
                    )}
                    {p.status === 'CONFIRMED' && (
                      <span className="text-[10px] font-black text-slate-300 uppercase px-4">Validado ✅</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}