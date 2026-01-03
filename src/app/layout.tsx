import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { ThemeProvider } from "@/core/theme/ThemeProvider";
import { RealtimeProvider } from "@/core/realtime/RealtimeProvider";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ORIZON - Plateforme de Gestion d'Événements",
  description: "Plateforme SaaS multitenant pour la gestion de festivals et événements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider>
            <RealtimeProvider>{children}</RealtimeProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
