import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import AntdAppProvider from "@/components/AntdApp";
import CSSLoader from "@/components/CSSLoader";
import '@ant-design/v5-patch-for-react-19';
// Importar CSS do Ant Design de forma otimizada
import 'antd/dist/reset.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ID Brasil",
  description: "Aplicação ID Brasil - Desafio Técnico",
};

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <CSSLoader>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            <AntdAppProvider>
              {children}
            </AntdAppProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </CSSLoader>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preload para CSS crítico */}
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        <link rel="preload" href="https://unpkg.com/antd@5.27.3/dist/reset.css" as="style" />
        {/* CSS crítico inline para evitar FOUC */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              margin: 0; 
              padding: 0; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .ant-layout { min-height: 100vh; }
            .ant-layout-header { position: sticky; top: 0; z-index: 1000; }
            * { box-sizing: border-box; }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppContent>
          {children}
        </AppContent>
      </body>
    </html>
  );
}
