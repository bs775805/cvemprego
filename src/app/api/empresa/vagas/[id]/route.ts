// src/app/api/empresa/vagas/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContractType, ExperienceLevel, Island, Sector } from "@prisma/client";

// APAGAR UMA VAGA (DELETE)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    // Verifica se a vaga pertence a esta empresa antes de apagar
    const vaga = await prisma.jobListing.findFirst({
      where: { id: params.id, company: { userId: session.user.id } }
    });

    if (!vaga) return NextResponse.json({ message: "Vaga não encontrada ou sem permissão" }, { status: 404 });

    // Apaga a vaga (as candidaturas ligadas a ela serão apagadas por causa do onDelete: Cascade no schema)
    await prisma.jobListing.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Erro ao apagar vaga" }, { status: 500 });
  }
}

// EDITAR UMA VAGA (PUT)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const data = await req.json();

    const vagaAtualizada = await prisma.jobListing.update({
      where: { id: params.id, company: { userId: session.user.id } },
      data: {
        title: data.title,
        description: data.description,
        contractType: data.contractType as ContractType,
        experienceLevel: data.experienceLevel as ExperienceLevel,
        island: data.island as Island,
        sector: data.sector as Sector,
        salaryMin: data.salaryMin ? parseInt(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseInt(data.salaryMax) : null,
      },
    });

    return NextResponse.json({ success: true, data: vagaAtualizada });
  } catch {
    return NextResponse.json({ message: "Erro ao atualizar vaga" }, { status: 500 });
  }
}