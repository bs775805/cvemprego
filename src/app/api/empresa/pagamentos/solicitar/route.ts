// src/app/api/empresa/pagamentos/solicitar/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const { jobId } = await req.json();

    // 1. Validar se a vaga existe e pertence à empresa
    const vaga = await prisma.jobListing.findFirst({
      where: { id: jobId, company: { userId: session.user.id } }
    });

    if (!vaga) {
      return NextResponse.json({ message: "Vaga não encontrada" }, { status: 404 });
    }

    // 2. Gerar Referência Única (Ex: CVE-2026-4829)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `CVE-${new Date().getFullYear()}-${randomSuffix}`;

    // 3. Criar o registo de Pagamento como PENDENTE
    const payment = await prisma.payment.create({
      data: {
        reference,
        companyId: vaga.companyId,
        jobId: vaga.id,
        plan: "DESTAQUE",
        amount: 800, // Preço fixo: 800 ECV
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, reference, amount: payment.amount });
  } catch (error) {
    console.error("Erro ao solicitar destaque:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}