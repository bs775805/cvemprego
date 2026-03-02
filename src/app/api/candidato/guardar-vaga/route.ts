// src/app/api/candidato/guardar-vaga/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const { jobId } = await req.json();

    // Verifica se já está guardada
    const existing = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId } }
    });

    if (existing) {
      // Se já está guardada, remove (Toggle)
      await prisma.savedJob.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, saved: false });
    } else {
      // Se não está, guarda
      await prisma.savedJob.create({
        data: { userId: session.user.id, jobId }
      });
      return NextResponse.json({ success: true, saved: true });
    }
  } catch {
    return NextResponse.json({ message: "Erro de servidor" }, { status: 500 });
  }
}