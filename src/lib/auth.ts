// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            candidateProfile: { select: { firstName: true, lastName: true } },
            companyProfile: { select: { name: true, logoUrl: true } }
          }
        })

        if (!user || !user.isActive) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        // Definir o nome e imagem dinamicamente para a sessão
        let name = user.email;
        let image = null;

        if (user.role === "CANDIDATE" && user.candidateProfile) {
          name = `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`;
        } else if (user.role === "EMPLOYER" && user.companyProfile) {
          name = user.companyProfile.name;
          image = user.companyProfile.logoUrl;
        }

        return { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: name,
          image: image
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { 
        token.role = user.role; 
        token.id = user.id; 
        token.name = user.name;
        token.picture = user.image;
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.picture as string;
      }
      return session
    }
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' }
}