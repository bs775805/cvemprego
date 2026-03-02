// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  // 1. Lemos a sessão no lado do servidor (Server Component)
  const session = await getServerSession(authOptions);

  // 2. Se não houver sessão, chuta o utilizador para o login
  if (!session) {
    redirect("/login");
  }

  // 3. Redirecionamento baseado na Role do utilizador
  if (session.user.role === "CANDIDATE") {
    redirect("/candidato/dashboard");
  } 
  else if (session.user.role === "EMPLOYER") {
    redirect("/empresa/dashboard");
  } 
  else if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } 
  else {
    // Fallback de segurança
    redirect("/");
  }
}