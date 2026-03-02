// src/app/candidato/perfil/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormularioPerfil from "./FormularioPerfil"; 

export default async function PerfilCandidatoPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { 
      user: { select: { email: true } },
      experience: true, // Importante: buscar relações
      education: true 
    }
  });

  if (!profile) redirect("/login");

  return (
    <div className="max-w-6xl mx-auto">
      {/* Passamos o perfil com tipagem inferida pelo Prisma */}
      <FormularioPerfil profile={profile} email={profile.user.email} />
    </div>
  );
}