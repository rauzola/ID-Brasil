'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

// Tipos para o tema
export type Theme = 'light' | 'dark';

// Interface do contexto de tema
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

// Configurações do tema
const THEME_CONFIG = {
  storageKey: 'theme',
  defaultTheme: 'light' as Theme,
  bodyClassName: {
    light: 'light',
    dark: 'dark',
  },
} as const;

// Criação do contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Props do provider
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider do contexto de tema
 * Gerencia o estado do tema (claro/escuro) com persistência no localStorage
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(THEME_CONFIG.defaultTheme);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Aplica o tema ao documento
   */
  const applyThemeToDocument = useCallback((newTheme: Theme) => {
    try {
      document.body.className = THEME_CONFIG.bodyClassName[newTheme];
    } catch (error) {
      console.warn('Erro ao aplicar tema ao documento:', error);
    }
  }, []);

  /**
   * Salva o tema no localStorage
   */
  const saveThemeToStorage = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(THEME_CONFIG.storageKey, newTheme);
    } catch (error) {
      console.warn('Erro ao salvar tema no localStorage:', error);
    }
  }, []);

  /**
   * Carrega o tema do localStorage
   */
  const loadThemeFromStorage = useCallback((): Theme => {
    try {
      const savedTheme = localStorage.getItem(THEME_CONFIG.storageKey) as Theme;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
    } catch (error) {
      console.warn('Erro ao carregar tema do localStorage:', error);
    }
    return THEME_CONFIG.defaultTheme;
  }, []);

  /**
   * Detecta a preferência do sistema
   */
  const detectSystemTheme = useCallback((): Theme => {
    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch (error) {
      console.warn('Erro ao detectar tema do sistema:', error);
      return THEME_CONFIG.defaultTheme;
    }
  }, []);

  /**
   * Inicializa o tema na primeira carga
   */
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = loadThemeFromStorage();
        
        if (savedTheme) {
          setTheme(savedTheme);
          applyThemeToDocument(savedTheme);
        } else {
          // Se não há tema salvo, usar preferência do sistema
          const systemTheme = detectSystemTheme();
          setTheme(systemTheme);
          applyThemeToDocument(systemTheme);
          saveThemeToStorage(systemTheme);
        }
      } catch (error) {
        console.warn('Erro ao inicializar tema:', error);
        // Fallback para tema claro em caso de erro
        setTheme(THEME_CONFIG.defaultTheme);
        applyThemeToDocument(THEME_CONFIG.defaultTheme);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTheme();
  }, [loadThemeFromStorage, detectSystemTheme, applyThemeToDocument, saveThemeToStorage]);

  /**
   * Salva o tema no localStorage quando mudar
   */
  useEffect(() => {
    if (isInitialized) {
      saveThemeToStorage(theme);
      applyThemeToDocument(theme);
    }
  }, [theme, isInitialized, saveThemeToStorage, applyThemeToDocument]);

  /**
   * Listener para mudanças na preferência do sistema
   */
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      // Só aplicar se não houver tema salvo manualmente
      const savedTheme = localStorage.getItem(THEME_CONFIG.storageKey);
      if (!savedTheme) {
        const systemTheme = event.matches ? 'dark' : 'light';
        setTheme(systemTheme);
        applyThemeToDocument(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [isInitialized, applyThemeToDocument]);

  /**
   * Alterna entre tema claro e escuro
   */
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  /**
   * Verifica se o tema atual é escuro
   */
  const isDark = theme === 'dark';

  /**
   * Valor do contexto memoizado
   */
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    isDark
  }), [theme, toggleTheme, isDark]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para usar o contexto de tema
 * @throws {Error} Se usado fora do ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  
  return context;
}