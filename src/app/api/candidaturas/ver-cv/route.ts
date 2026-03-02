// src/app/api/candidaturas/ver-cv/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { r2 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const dynamic = 'force-dynamic'; 


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Segurança: Apenas Empresas ou Admins podem gerar links de CVs
    if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key"); // O caminho do ficheiro no R2 (ex: cvs/...)

    if (!key) {
      return NextResponse.json({ message: "Ficheiro não especificado" }, { status: 400 });
    }

    // 2. Gerar URL assinado válido por 60 minutos (3600 segundos)
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(r2, command, { expiresIn: 3600 });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Erro ao gerar link do CV:", error);
    return NextResponse.json({ message: "Erro ao abrir o ficheiro" }, { status: 500 });
  }
}