import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PanelNavigation } from "@/components/layout/panel-navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EntregaPyme | Delivery para negocios",
  description: "Cotiza, solicita y controla tus deliveries desde una sola plataforma.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-20 md:pb-0">{children}<PanelNavigation /></body>
    </html>
  );
}
