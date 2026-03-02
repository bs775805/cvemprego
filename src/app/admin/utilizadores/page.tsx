// src/app/admin/utilizadores/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Shield, User, Building2, Ban, CheckCircle } from "lucide-react";

interface UserAdmin {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  candidateProfile?: { firstName: string; lastName: string; island: string } | null;
  companyProfile?: { name: string; island: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const carregarUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUsers(); }, []);

  const toggleUserStatus = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}/toggle-status`, { method: 'PATCH' });
    if (res.ok) {
      setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    }
  };

  const usersFiltrados = users.filter(u => filter === "ALL" ? true : u.role === filter);

  return (
    <div className="max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Utilizadores</h1>
          <p className="text-sm text-slate-500">Administra todas as contas registadas no sistema</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {["ALL", "CANDIDATE", "EMPLOYER", "ADMIN"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {f === "ALL" ? "Todos" : f === "CANDIDATE" ? "Candidatos" : f === "EMPLOYER" ? "Empresas" : "Admins"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
            <tr>
              <th className="px-8 py-5">Utilizador / Nome</th>
              <th className="px-8 py-5">Papel</th>
              <th className="px-8 py-5">Ilha</th>
              <th className="px-8 py-5 text-center">Estado</th>
              <th className="px-8 py-5 text-right">Acções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
            ) : (
              usersFiltrados.map((user) => {
                const nome = user.role === "CANDIDATE" 
                  ? `${user.candidateProfile?.firstName} ${user.candidateProfile?.lastName}`
                  : user.role === "EMPLOYER" ? user.companyProfile?.name : "Administrador";
                
                const ilha = user.role === "CANDIDATE" ? user.candidateProfile?.island : user.companyProfile?.island;

                return (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${!user.isActive ? "bg-red-50/20" : ""}`}>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900 leading-none mb-1">{nome || "Sem Nome"}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </td>
                    <td className="px-8 py-5 font-bold">
                      <span className={`inline-flex items-center gap-1.5 ${
                        user.role === 'ADMIN' ? 'text-red-600' : user.role === 'EMPLOYER' ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                        {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5" /> : user.role === 'EMPLOYER' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-600 font-medium">{ilha || "—"}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        user.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        {user.isActive ? "Activo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {user.role !== "ADMIN" && (
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            user.isActive 
                            ? "border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100" 
                            : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                          title={user.isActive ? "Bloquear Utilizador" : "Desbloquear Utilizador"}
                        >
                          {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}