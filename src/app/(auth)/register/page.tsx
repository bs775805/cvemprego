// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Building2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Esquema de Validação Zod (Garante que os dados estão corretos no Frontend)
const registerSchema = z.object({
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
  firstName: z.string().min(2, "Nome muito curto").optional().or(z.literal("")),
  lastName: z.string().min(2, "Apelido muito curto").optional().or(z.literal("")),
  companyName: z.string().min(2, "Nome da empresa muito curto").optional().or(z.literal("")),
  email: z.string().email("Email inválido"),
  island: z.enum(
    ["SANTIAGO", "SAO_VICENTE", "SAL", "SANTO_ANTAO", "FOGO", "BOA_VISTA", "SAO_NICOLAU", "BRAVA", "MAIO"],
    { message: "Por favor, seleciona uma ilha" }
  ),
  password: z.string().min(8, "A password deve ter no mínimo 8 caracteres"),
}).superRefine((data, ctx) => {
  // Validações condicionais: Se for candidato, exige nome. Se for empresa, exige nome da empresa.
  if (data.role === "CANDIDATE") {
    if (!data.firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome é obrigatório", path: ["firstName"] });
    if (!data.lastName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Apelido é obrigatório", path: ["lastName"] });
  }
  if (data.role === "EMPLOYER") {
    if (!data.companyName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome da empresa é obrigatório", path: ["companyName"] });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 2. Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "CANDIDATE",
    },
  });

  const role = watch("role");

  // 3. Função executada ao submeter o formulário
  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError("");
    setSuccessMsg("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ocorreu um erro ao criar a conta.");
      }

      setSuccessMsg("Conta criada com sucesso! A redirecionar para o login...");
      
      // Aguarda 2 segundos e redireciona para o login
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      if (error instanceof Error) {
        setGlobalError(error.message);
      } else {
        setGlobalError("Ocorreu um erro desconhecido.");
      }
    }
  };

  return (
    <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-sm border border-slate-100 p-8 my-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Criar conta gratuita</h1>
        <p className="text-slate-500 text-sm">Escolhe o tipo de conta</p>
      </div>

      {/* Alertas Globais (Sucesso ou Erro da API) */}
      {globalError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {globalError}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
          {successMsg}
        </div>
      )}

      {/* Seletor de Tipo de Conta */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setValue("role", "CANDIDATE")}
          className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
            role === "CANDIDATE"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
          }`}
        >
          <User className={`w-8 h-8 mb-2 ${role === "CANDIDATE" ? "text-blue-600" : "text-slate-400"}`} />
          <span className="font-semibold text-sm mb-1 text-slate-900">Sou Candidato</span>
          <span className="text-xs">Procuro emprego</span>
        </button>

        <button
          type="button"
          onClick={() => setValue("role", "EMPLOYER")}
          className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
            role === "EMPLOYER"
              ? "border-blue-600 bg-blue-50/50 text-blue-700"
              : "border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Building2 className={`w-8 h-8 mb-2 ${role === "EMPLOYER" ? "text-blue-600" : "text-slate-400"}`} />
          <span className="font-semibold text-sm mb-1 text-slate-900">Sou Empresa</span>
          <span className="text-xs">Quero recrutar</span>
        </button>
      </div>

      {/* Formulário ligado ao handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {role === "CANDIDATE" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-900">Nome</label>
              <input
                {...register("firstName")}
                type="text"
                placeholder="João"
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'}`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-900">Apelido</label>
              <input
                {...register("lastName")}
                type="text"
                placeholder="Silva"
                className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'}`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
        )}

        {role === "EMPLOYER" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-900">Nome da Empresa</label>
            <input
              {...register("companyName")}
              type="text"
              placeholder="Ex: CV Telecom"
              className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors ${errors.companyName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'}`}
            />
            {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-900">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="joao@email.com"
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-900">Ilha</label>
          <select 
            {...register("island")}
            defaultValue=""
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors appearance-none ${errors.island ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'}`}
          >
            <option value="" disabled>Seleccionar ilha...</option>
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
          {errors.island && <p className="text-red-500 text-xs mt-1">{errors.island.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-900">Password</label>
          <input
            {...register("password")}
            type="password"
            placeholder="Mínimo 8 caracteres"
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-600'}`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <p className="text-[13px] text-slate-500 pt-2">
          Ao criar conta, aceitas os nossos{" "}
          <Link href="/termos" className="text-blue-700 hover:underline">Termos de Uso</Link> e{" "}
          <Link href="/privacidade" className="text-blue-700 hover:underline">Política de Privacidade</Link>.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg transition-colors mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              A criar conta...
            </>
          ) : (
            "Criar conta grátis →"
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-600">
            Já tens conta?{" "}
            <Link href="/login" className="text-blue-700 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}