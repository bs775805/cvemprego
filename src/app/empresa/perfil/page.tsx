// src/app/empresa/perfil/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormularioEmpresa from "./FormularioEmpresa";

interface CompanyProfileData {
  name: string;
  nif: string | null;
  island: string;
  sector: string;
  size: string;
  website: string | null;
  description: string | null;
  logoUrl: string | null; // <-- ADICIONADO
}

export default async function PerfilEmpresaPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "EMPLOYER") {
    redirect("/login");
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    redirect("/login");
  }

  const companyData: CompanyProfileData = {
    name: company.name,
    nif: company.nif,
    island: company.island,
    sector: company.sector,
    size: company.size,
    website: company.website,
    description: company.description,
    logoUrl: company.logoUrl, // <-- ADICIONADO
  };

  return (
    <div className="max-w-5xl mx-auto">
      <FormularioEmpresa company={companyData} />
    </div>
  );
}