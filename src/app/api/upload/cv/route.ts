// src/app/api/upload/cv/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic'; 


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "Nenhum ficheiro enviado" }, { status: 400 });
    }

    // 1. Preparar ficheiro
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const fileName = `cvs/${session.user.id}-${Date.now()}.${fileExtension}`;

    // 2. Upload para R2 (Atenção ao nome da variável aqui!)
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // 3. ACTUALIZAR BASE DE DADOS
    // É aqui que o "Sem currículo carregado" muda para "CV activo"
    await prisma.candidateProfile.update({
      where: { userId: session.user.id },
      data: {
        cvUrl: fileName,
        cvOriginalName: file.name,
        cvUploadedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error("Erro detalhado no upload:", error);
    return NextResponse.json({ message: "Falha técnica no upload" }, { status: 500 });
  }
}