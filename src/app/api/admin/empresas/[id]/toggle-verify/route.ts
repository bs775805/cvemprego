// src/app/api/admin/empresas/[id]/toggle-verify/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const company = await prisma.companyProfile.findUnique({ where: { id: params.id } });
    if (!company) return NextResponse.json({ message: "Empresa não encontrada" }, { status: 404 });

    const updatedCompany = await prisma.companyProfile.update({
      where: { id: params.id },
      data: { isVerified: !company.isVerified }
    });

    return NextResponse.json({ success: true, isVerified: updatedCompany.isVerified });
  } catch {
    return NextResponse.json({ message: "Erro ao atualizar estado" }, { status: 500 });
  }
}