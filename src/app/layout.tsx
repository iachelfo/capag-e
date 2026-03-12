import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SerwistProvider } from "./serwist";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "CAPAG-e";
const APP_TITLE = "CAPAG-e | Gerador de Laudo Técnico";
const APP_DESC =
  "Sistema de geração automatizada de Laudo Técnico de Capacidade de Pagamento Extraordinária para transações tributárias junto à PGFN";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_TITLE,
    template: "%s | CAPAG-e",
  },
  description: APP_DESC,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESC,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/chelfo-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TRPCProvider>
            <SerwistProvider swUrl="/serwist/sw.js">
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 lg:ml-64">
                  <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
                </main>
              </div>
              <Toaster />
            </SerwistProvider>
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
