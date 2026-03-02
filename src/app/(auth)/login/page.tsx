// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

// 1. Esquema de Validação Zod
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A password é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");

  // 2. Configuração do React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 3. Função executada ao submeter o formulário
  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError("");

    try {
      // O NextAuth trata de enviar as credenciais para o nosso lib/auth.ts
      const result = await signIn("credentials", {
        redirect: false, // Importante: gerimos o redirecionamento manualmente
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // Se a password for errada ou o utilizador não existir
        setGlobalError("Email ou password incorretos.");
      } else {
        // Sucesso! Redirecionar para o dashboard
        router.push("/dashboard");
        router.refresh(); // Atualiza o estado da sessão no lado do cliente
      }
    } catch {
      setGlobalError("Ocorreu um erro ao tentar iniciar sessão.");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          CV<span className="text-blue-700">emprego</span>
        </h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h2>
        <p className="text-slate-500 text-sm">Entra na tua conta para continuar</p>
      </div>

      {/* Alerta de Erro Global */}
      {globalError && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
          {globalError}
        </div>
      )}

      {/* Formulário ligado ao handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-900">Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="o.teu@email.com"
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors ${
              errors.email ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-900">Password</label>
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className={`w-full px-3 py-2.5 bg-white border rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-colors ${
              errors.password ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          <div className="flex justify-end pt-1">
            <Link href="/recover" className="text-sm text-blue-600 hover:underline">
              Esqueceste a password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors mt-2 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              A entrar...
            </>
          ) : (
            "Entrar"
          )}
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">ou</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* 
          Como o nosso login serve para Candidatos e Empresas (o sistema sabe quem é quem 
          pelo email), este botão pode apenas redirecionar para o registo de empresa 
          ou manter-se por motivos de design/ux.
        */}
        <Link href="/register">
          <button
            type="button"
            className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
          >
            Entrar como Empresa
          </button>
        </Link>

        <div className="text-center pt-4">
          <p className="text-sm text-slate-600">
            Ainda não tens conta?{" "}
            <Link href="/register" className="text-blue-700 font-semibold hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}