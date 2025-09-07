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

// Configurações das fontes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadados da aplicação
export const metadata: Metadata = {
  title: "ID Brasil",
  description: "Aplicação ID Brasil - Desafio Técnico",
};

// Script para aplicar tema imediatamente (evita FOUC)
const THEME_SCRIPT = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        document.body.className = savedTheme;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.className = prefersDark ? 'dark' : 'light';
      }
    } catch (e) {
      document.body.className = 'light';
    }
  })();
`;

// CSS crítico inline para evitar FOUC
const CRITICAL_CSS = `
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
`;

// Links de preload para CSS crítico
const CRITICAL_CSS_LINKS = [
  { rel: "preload", href: "/_next/static/css/app/layout.css", as: "style" },
  { rel: "preload", href: "https://unpkg.com/antd@5.27.3/dist/reset.css", as: "style" },
];

/**
 * Componente de conteúdo da aplicação
 * Organiza os providers em ordem hierárquica
 */
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

/**
 * Layout raiz da aplicação
 * Configura metadados, fontes, scripts críticos e providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preload para CSS crítico */}
        {CRITICAL_CSS_LINKS.map((link, index) => (
          <link key={index} {...link} />
        ))}
        
        {/* Script para aplicar tema imediatamente */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        
        {/* CSS crítico inline para evitar FOUC */}
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
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