// src/app/api/vagas/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Island, Sector, ContractType, ExperienceLevel } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const island = searchParams.get("island");
    const sector = searchParams.get("sector");
    const contract = searchParams.get("contract");
    const experience = searchParams.get("experience");
    const q = searchParams.get("q");

    const whereClause: Prisma.JobListingWhereInput = { status: "ACTIVE" };

    if (island && island !== "") {
      const islands = island.split(",").filter(i => i !== "") as Island[];
      if (islands.length > 0) whereClause.island = { in: islands };
    }

    if (sector && sector !== "" && sector !== "todos") {
      whereClause.sector = sector as Sector;
    }

    if (contract && contract !== "") {
      const contracts = contract.split(",").filter(c => c !== "") as ContractType[];
      if (contracts.length > 0) whereClause.contractType = { in: contracts };
    }

    if (experience && experience !== "") {
      const levels = experience.split(",").filter(l => l !== "") as ExperienceLevel[];
      if (levels.length > 0) whereClause.experienceLevel = { in: levels };
    }

    if (q && q.trim() !== "") {
      whereClause.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const vagas = await prisma.jobListing.findMany({
      where: whereClause,
      include: {
        company: { select: { name: true, isVerified: true, logoUrl: true } },
        // 👇 ADICIONADO: Enviar o contador de candidaturas para o Admin ver
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: vagas });
  } catch (error) {
    console.error("Erro na API de Vagas:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}