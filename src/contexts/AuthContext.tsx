'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '@/services/api';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  sessionExpiresAt: number | null;
  isRefreshing: boolean;
  isSessionExpiring: boolean;
  tryRefreshNow: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);
  const [refreshAttempts, setRefreshAttempts] = useState(0);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setSessionExpiresAt(null);
    setIsSessionExpiring(false);
    setRefreshAttempts(0);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiresAt');
  }, []);

  const validateToken = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('AuthContext: Token inválido ou expirado:', error);
      // Token inválido, limpar dados
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Verificar se há dados de autenticação salvos
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedExpiresAt = localStorage.getItem('sessionExpiresAt');

    if (savedToken && savedUser && savedExpiresAt) {
      const expiresAt = parseInt(savedExpiresAt);
      const now = Date.now();
      
      // Verificar se a sessão ainda é válida (10 minutos)
      if (expiresAt > now) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setSessionExpiresAt(expiresAt);
        
        // Validar token com a API
        validateToken();
      } else {
        // Sessão expirada, limpar dados
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [logout, validateToken]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      return false;
    }

    setIsRefreshing(true);
    try {
      
      const response = await authService.refreshToken();
      
      if (response.token || response.accessToken) {
        const newToken = response.token || response.accessToken;
        const newRefreshToken = response.refreshToken || newToken;
        const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutos de sessão
        
        setToken(newToken);
        setSessionExpiresAt(expiresAt);
        setRefreshAttempts(0); // Reset contador de tentativas
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        localStorage.setItem('sessionExpiresAt', expiresAt.toString());
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('AuthContext: Erro ao renovar token:', error);
      setRefreshAttempts(prev => prev + 1);
      
      // Só fazer logout se já tentou 3 vezes e ainda falhou
      if (refreshAttempts >= 2) {
        logout();
        return false;
      }
      
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshAttempts, logout]);

  // Effect para gerenciar refresh automático de token
  useEffect(() => {
    if (!isAuthenticated || !sessionExpiresAt) return;

    const checkAndRefreshToken = async () => {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiresAt - now;
      
      // Marcar como expirando se restam menos de 3 minutos
      if (timeUntilExpiry < 3 * 60 * 1000 && timeUntilExpiry > 0) {
        setIsSessionExpiring(true);
      } else {
        setIsSessionExpiring(false);
      }
      
      // Se restam menos de 2 minutos, tentar refresh automático
      if (timeUntilExpiry < 2 * 60 * 1000 && timeUntilExpiry > 0 && !isRefreshing) {
        const success = await refreshToken();
        if (success) {
          setIsSessionExpiring(false);
          setRefreshAttempts(0); // Reset contador em caso de sucesso
        } else if (refreshAttempts < 2) {
          // Se falhou mas ainda não tentou 3 vezes, tentar novamente em 5 segundos
          setTimeout(() => {
            if (timeUntilExpiry > 0) { // Só tentar se ainda não expirou
              refreshToken();
            }
          }, 5000);
        }
      }
    };

    // Verificar imediatamente
    checkAndRefreshToken();

    // Verificar a cada 30 segundos (para sessão de 10 minutos)
    const interval = setInterval(checkAndRefreshToken, 30 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionExpiresAt, isRefreshing, refreshToken, refreshAttempts]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, password);
  
      if (response.token || response.accessToken) {
        const token = response.token || response.accessToken;
        const refreshToken = response.refreshToken || response.token;
        const expiresAt = Date.now() + (10 * 60 * 1000);
  
         // Buscar os dados completos do usuário para pegar o role
         const userDetails = await authService.getUserById(response.id);
         
 
         if (userDetails.role !== "admin" && userDetails.role !== "user") {
           // Usar uma classe de erro personalizada para evitar logs de erro desnecessários
           const roleError = new Error("Usuário não cadastrado no sistema");
           roleError.name = "RoleValidationError";
           throw roleError;
         }
  
        // Gravar usuário + role válido
        const userWithRole = { ...response, role: userDetails.role };
  
        setUser(userWithRole);
        setToken(token);
        setSessionExpiresAt(expiresAt);
  
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userWithRole));
        localStorage.setItem('sessionExpiresAt', expiresAt.toString());
  
        return true;
      }
  
      return false;
     } catch (error) {
       // Verificar se é erro de role inválido (comportamento esperado)
       const errorName = error instanceof Error ? error.name : '';
       const errorMessage = error instanceof Error ? error.message : '';
       
       if (errorName === 'RoleValidationError' || errorMessage === 'Usuário não cadastrado no sistema') {
       } else {
         console.error('AuthContext: Erro no login:', error);
       }
       // Re-lançar o erro para que seja capturado na página de login
       throw error;
     }
  };
  

  const refreshUserData = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }, []);

  const tryRefreshNow = useCallback(async () => {
    if (!isRefreshing && sessionExpiresAt) {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiresAt - now;
      
      if (timeUntilExpiry > 0) {
        await refreshToken();
      }
    }
  }, [isRefreshing, sessionExpiresAt, refreshToken]);


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        loading,
        refreshUserData,
        refreshToken,
        sessionExpiresAt,
        isRefreshing,
        isSessionExpiring,
        tryRefreshNow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
