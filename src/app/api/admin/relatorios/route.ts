// src/app/api/admin/relatorios/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// --- 1. Interface para a agregação de dados ---
interface CrescimentoItem {
  name: string;
  total: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificação de segurança: Apenas ADMIN acede aos dados agregados
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    // 2. Crescimento de Registos (Últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: seisMesesAtras } },
      select: { createdAt: true }
    });

    const mesesLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Agrupamento de dados com tipagem estrita (Removido o 'any')
    const crescimentoData = users.reduce((acc: CrescimentoItem[], user) => {
      const mesNome = mesesLabels[new Date(user.createdAt).getMonth()];
      const itemExistente = acc.find(i => i.name === mesNome);
      
      if (itemExistente) {
        itemExistente.total++;
      } else {
        acc.push({ name: mesNome, total: 1 });
      }
      return acc;
    }, []);

    // 3. Estatísticas de Vagas por Sector
    const sectorStats = await prisma.jobListing.groupBy({
      by: ['sector'],
      _count: { _all: true },
    });

    // 4. Estatísticas de Candidatos por Ilha
    const islandStats = await prisma.candidateProfile.groupBy({
      by: ['island'],
      _count: { _all: true },
    });

    // 5. Retorno dos dados formatados para os gráficos do Recharts
    return NextResponse.json({
      success: true,
      data: {
        crescimento: crescimentoData,
        sectores: sectorStats.map(s => ({ 
          name: s.sector, 
          valor: s._count._all 
        })),
        ilhas: islandStats.map(i => ({ 
          name: i.island, 
          valor: i._count._all 
        }))
      }
    });

  } catch (error) {
    console.error("Erro técnico nos relatórios:", error);
    return NextResponse.json({ message: "Erro ao processar estatísticas" }, { status: 500 });
  }
}