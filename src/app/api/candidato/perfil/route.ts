// src/app/api/candidato/perfil/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Island, Sector } from "@prisma/client";

interface ExperienceInput { company: string; title: string; description: string; }
interface EducationInput { institution: string; degree: string; }

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CANDIDATE") return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

    const data = await req.json();

    // 1. Procurar o ID real do Perfil do Candidato
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) return NextResponse.json({ message: "Perfil não encontrado" }, { status: 404 });

    let complete = 25; 
    if (data.experience?.length > 0) complete += 25;
    if (data.education?.length > 0) complete += 25;
    if (data.bio?.length > 10) complete += 25;

    // 2. Transação: Apagar as antigas usando o ID do PERFIL (profile.id) e criar as novas
    await prisma.$transaction([
      prisma.workExperience.deleteMany({ where: { candidateId: profile.id } }),
      prisma.education.deleteMany({ where: { candidateId: profile.id } }),

      prisma.candidateProfile.update({
        where: { id: profile.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          island: data.island as Island,
          preferredSector: data.preferredSector as Sector,
          bio: data.bio,
          profileComplete: complete > 100 ? 100 : complete,
          
          experience: {
            create: data.experience.map((exp: ExperienceInput) => ({
              company: exp.company,
              title: exp.title,
              description: exp.description,
              startDate: new Date(),
            }))
          },
          education: {
            create: data.education.map((edu: EducationInput) => ({
              institution: edu.institution,
              degree: edu.degree,
              startYear: 2020,
            }))
          }
        },
      })
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Erro ao salvar alterações." }, { status: 500 });
  }
}