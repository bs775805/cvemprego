// src/app/api/admin/vagas/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Segurança: Verificar se é ADMIN
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Acesso negado. Apenas administradores." }, { status: 403 });
    }

    // 2. Apagar a vaga (as candidaturas associadas serão apagadas em cascata)
    await prisma.jobListing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Vaga removida pelo administrador." });
  } catch (error) {
    console.error("Erro Admin Delete:", error);
    return NextResponse.json({ message: "Erro ao remover a vaga." }, { status: 500 });
  }
}