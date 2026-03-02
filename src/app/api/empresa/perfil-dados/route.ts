import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const profile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        name: true,
        logoUrl: true,
      }
    });

    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}