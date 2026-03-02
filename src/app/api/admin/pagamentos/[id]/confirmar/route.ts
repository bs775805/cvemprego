// src/app/api/admin/pagamentos/[id]/confirmar/route.ts
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
    
    // 1. Validar se é Admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // 2. Procurar o pagamento
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { job: true }
    });

    if (!payment || !payment.jobId) {
      return NextResponse.json({ message: "Pagamento ou Vaga não encontrados" }, { status: 404 });
    }

    // 3. Executar Transação (Mudar pagamento + Activar Vaga)
    const seteDiasDepois = new Date();
    seteDiasDepois.setDate(seteDiasDepois.getDate() + 7);

    await prisma.$transaction([
      // Actualiza o pagamento
      prisma.payment.update({
        where: { id: params.id },
        data: { 
          status: "CONFIRMED",
          confirmedAt: new Date(),
          activatedAt: new Date(),
          expiresAt: seteDiasDepois
        }
      }),
      // Activa o destaque na vaga real
      prisma.jobListing.update({
        where: { id: payment.jobId },
        data: { 
          isFeatured: true,
          featuredUntil: seteDiasDepois
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao confirmar pagamento:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}