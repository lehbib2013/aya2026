import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AYA PÊCHE - Gestion",
  description: "Système de gestion de la pêche AYA PÊCHE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
