// src/app/api/vagas/nova/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContractType, ExperienceLevel, Island, Sector, JobType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // 1. Verifica a sessão
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    // 2. Procura a Empresa associada a este utilizador
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!companyProfile) {
      return NextResponse.json({ message: "Perfil de empresa não encontrado." }, { status: 404 });
    }

    // 3. Recebe os dados
    const data = await req.json();

    // 4. Cria a vaga
    const newJob = await prisma.jobListing.create({
      data: {
        companyId: companyProfile.id,
        title: data.title,
        description: data.description,
        jobType: JobType.FULL_TIME, // Padrão
        contractType: data.contractType as ContractType,
        experienceLevel: data.experienceLevel as ExperienceLevel,
        island: data.island as Island,
        sector: data.sector as Sector,
        salaryMin: data.salaryMin ? parseInt(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseInt(data.salaryMax) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: "ACTIVE",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, jobId: newJob.id }, { status: 201 });
  } catch (error) {
    console.error("Erro ao publicar vaga:", error);
    return NextResponse.json({ message: "Erro ao publicar a vaga." }, { status: 500 });
  }
}