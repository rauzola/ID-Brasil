'use client';

import { useEffect, useState } from 'react';
import { Spin } from 'antd';

const CSSLoader = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aplicar tema imediatamente se ainda não foi aplicado
    const applyTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          if (document.body.className !== savedTheme) {
            document.body.className = savedTheme;
          }
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const systemTheme = prefersDark ? 'dark' : 'light';
          if (document.body.className !== systemTheme) {
            document.body.className = systemTheme;
          }
        }
      } catch {
        if (document.body.className !== 'light') {
          document.body.className = 'light';
        }
      }
    };

    // Aplicar tema imediatamente
    applyTheme();

    // Verificar se o CSS do Ant Design foi carregado
    const checkCSSLoaded = () => {
      const antdStyles = document.querySelector('style[data-antd]') || 
                        document.querySelector('link[href*="antd"]') ||
                        document.querySelector('style[data-nextjs-css]');
      
      if (antdStyles || document.readyState === 'complete') {
        // Pequeno delay para garantir que todos os estilos foram aplicados
        setTimeout(() => {
          applyTheme(); // Aplicar tema novamente antes de finalizar
          setIsLoading(false);
        }, 100);
      } else {
        // Verificar novamente em 50ms
        setTimeout(checkCSSLoaded, 50);
      }
    };

    // Verificar imediatamente e depois periodicamente
    checkCSSLoaded();
    
    // Fallback: parar de carregar após 2 segundos
    const timeout = setTimeout(() => {
      applyTheme(); // Aplicar tema antes do fallback
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, fontSize: 16, color: 'var(--text-secondary)' }}>
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default CSSLoader;
