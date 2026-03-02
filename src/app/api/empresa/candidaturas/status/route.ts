// src/app/api/empresa/candidaturas/status/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { applicationId, newStatus } = await req.json();

    // Actualizar a candidatura
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus as ApplicationStatus },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Erro ao actualizar estado" }, { status: 500 });
  }
}