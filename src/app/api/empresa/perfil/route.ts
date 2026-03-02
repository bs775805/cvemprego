// src/app/api/empresa/perfil/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Island, Sector, CompanySize } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const data = await req.json();

    await prisma.companyProfile.update({
      where: { userId: session.user.id },
      data: {
        name: data.name,
        nif: data.nif,
        island: data.island as Island,
        sector: data.sector as Sector,
        size: data.size as CompanySize,
        website: data.website,
        description: data.description,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Erro ao actualizar perfil" }, { status: 500 });
  }
}