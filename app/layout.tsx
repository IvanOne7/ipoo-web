import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import RegistrarSW from "@/components/registrar-sw";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "iPoo — Encuentra tu baño",
  description: "Localiza, puntúa y reseña baños públicos cerca de ti.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "iPoo",
  },
};

export const viewport = {
  themeColor: "#14b8a6",
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={nunito.className}>
        <RegistrarSW />
        {children}
      </body>
    </html>
  );
}