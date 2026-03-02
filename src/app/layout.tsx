// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CVemprego — Portal de Emprego e Estágios para Cabo Verde",
  description: "Encontra o teu emprego nas 9 ilhas de Cabo Verde. Conectamos talentos e empresas locais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={inter.className}>
        {/* Este Provedor permite que useSession() funcione em qualquer página ou layout */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}