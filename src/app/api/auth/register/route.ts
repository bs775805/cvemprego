// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import * as z from "zod";

// 1. Definimos as regras de validação (Zod)
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "A password deve ter no mínimo 8 caracteres"),
  role: z.enum(["CANDIDATE", "EMPLOYER"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  island: z.enum([
    "SANTIAGO", "SAO_VICENTE", "SAL", "SANTO_ANTAO", 
    "FOGO", "BOA_VISTA", "SAO_NICOLAU", "BRAVA", "MAIO"
  ]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 2. Validar os dados recebidos
    const parsedData = registerSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, message: "Dados inválidos fornecidos." },
        { status: 400 }
      );
    }

    const { email, password, role, firstName, lastName, companyName, island } = parsedData.data;

    // 3. Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Este email já está registado na plataforma." },
        { status: 400 }
      );
    }

    // 4. Encriptar a password com bcryptjs (12 rounds)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Salvar na Base de Dados usando uma Transação
    // O Prisma $transaction garante que se o Perfil falhar, o User também não é criado (evita contas "fantasmas")
    await prisma.$transaction(async (tx) => {
      // Cria a conta de acesso base
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role,
        },
      });

      // Cria o perfil detalhado dependendo do tipo de conta
      if (role === "CANDIDATE") {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
            firstName: firstName || "",
            lastName: lastName || "",
            island: island,
          },
        });
      } else if (role === "EMPLOYER") {
        await tx.companyProfile.create({
          data: {
            userId: user.id,
            name: companyName || "",
            island: island,
            sector: "OTHER", // Valor padrão obrigatório pelo teu schema.prisma
          },
        });
      }
    });

    return NextResponse.json(
      { success: true, message: "Conta criada com sucesso!" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erro no registo (API):", error);
    return NextResponse.json(
      { success: false, message: "Ocorreu um erro interno. Tenta novamente." },
      { status: 500 }
    );
  }
}