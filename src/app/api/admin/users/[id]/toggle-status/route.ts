// src/app/api/admin/users/[id]/toggle-status/route.ts
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

    // 1. Procurar utilizador actual
    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ message: "Utilizador não encontrado" }, { status: 404 });

    // 2. Inverter o estado de isActive
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: !user.isActive }
    });

    return NextResponse.json({ success: true, isActive: updatedUser.isActive });
  } catch  {
    return NextResponse.json({ message: "Erro ao alterar estado" }, { status: 500 });
  }
}