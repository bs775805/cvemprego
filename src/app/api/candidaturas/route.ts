// src/app/api/candidaturas/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; 


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Verifica se está logado e é candidato
    if (!session || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ message: "Apenas candidatos podem submeter candidaturas." }, { status: 401 });
    }

    // 2. Encontra o perfil de candidato associado ao utilizador
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!candidateProfile) {
      return NextResponse.json({ message: "Perfil de candidato não encontrado." }, { status: 404 });
    }

    const data = await req.json();

    // 3. Verifica se já se candidatou a esta vaga
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidateProfile.id,
          jobId: data.jobId,
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json({ message: "Já te candidataste a esta vaga." }, { status: 400 });
    }

    // 4. Cria a candidatura
    const application = await prisma.application.create({
      data: {
        candidateId: candidateProfile.id,
        jobId: data.jobId,
        coverMessage: data.coverMessage,
        cvUrl: data.cvFileName || "cv_guardado_no_perfil.pdf", // Simulação por agora
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 });
    
  } catch (error) {
    console.error("Erro ao submeter candidatura:", error);
    return NextResponse.json({ message: "Erro ao processar a candidatura." }, { status: 500 });
  }
}