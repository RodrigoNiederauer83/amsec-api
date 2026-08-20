import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Secretin — Amigo secreto sem complicação",
  description: "O Secretin organiza seu amigo secreto do início ao fim: convide, defina as regras e deixe o sorteio revelar quem é quem, sem grupo de WhatsApp lotado de spoiler.",
  icons: {
    icon: "/images/favicon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Secretin",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${fredoka.variable} ${inter.variable} font-body bg-background text-foreground antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}