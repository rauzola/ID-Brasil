'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authenticationService, userManagementService } from '@/services/api';
import { UserRole } from '@/types/user';

// Configurações de autenticação
const AUTH_CONFIG = {
  tokenKey: 'token',
  userKey: 'user',
  sessionExpirationBuffer: 5 * 60 * 1000, // 5 minutos antes da expiração
  refreshCheckInterval: 60 * 1000, // Verificar a cada minuto
} as const;

// Interface para dados do usuário autenticado
interface AuthenticatedUser {
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
  role?: UserRole;
}

// Interface do contexto de autenticação
interface AuthContextType {
  user: AuthenticatedUser | null;
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

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props do provider
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider do contexto de autenticação
 * Gerencia estado de autenticação, tokens e sessão do usuário
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estados principais
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);

  /**
   * Carrega dados do usuário do localStorage
   */
  const loadUserFromStorage = useCallback((): AuthenticatedUser | null => {
    try {
      const storedUser = localStorage.getItem(AUTH_CONFIG.userKey);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error);
      return null;
    }
  }, []);

  /**
   * Carrega token do localStorage
   */
  const loadTokenFromStorage = useCallback((): string | null => {
    try {
      return localStorage.getItem(AUTH_CONFIG.tokenKey);
    } catch (error) {
      console.error('Erro ao carregar token do localStorage:', error);
      return null;
    }
  }, []);

  /**
   * Salva dados do usuário no localStorage
   */
  const saveUserToStorage = useCallback((userData: AuthenticatedUser) => {
    try {
      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar usuário no localStorage:', error);
    }
  }, []);

  /**
   * Salva token no localStorage
   */
  const saveTokenToStorage = useCallback((authToken: string) => {
    try {
      localStorage.setItem(AUTH_CONFIG.tokenKey, authToken);
    } catch (error) {
      console.error('Erro ao salvar token no localStorage:', error);
    }
  }, []);

  /**
   * Limpa dados de autenticação do localStorage
   */
  const clearAuthFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_CONFIG.userKey);
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  }, []);

  /**
   * Valida se o token está válido
   */
  const validateToken = useCallback(async () => {
    try {
      const userData = await authenticationService.getCurrentUser();
      const authenticatedUser: AuthenticatedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        image: userData.image || userData.profileImageUrl || '',
        role: userData.role,
      };
      setUser(authenticatedUser);
    } catch (error) {
      console.error('Token inválido:', error);
      clearAuthFromStorage();
      setUser(null);
      setToken(null);
    }
  }, [clearAuthFromStorage]);

  /**
   * Atualiza dados do usuário
   */
  const refreshUserData = useCallback(async () => {
    try {
      const userData = await authenticationService.getCurrentUser();
      const authenticatedUser: AuthenticatedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        gender: userData.gender,
        image: userData.image || userData.profileImageUrl || '',
        role: userData.role,
      };
      setUser(authenticatedUser);
      saveUserToStorage(authenticatedUser);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  }, [saveUserToStorage]);

  /**
   * Renova o token de autenticação
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authenticationService.refreshAuthenticationToken();
      
      if (response.token || response.accessToken) {
        const newToken = response.token || response.accessToken;
        setToken(newToken);
        saveTokenToStorage(newToken);
        
        // Atualizar dados do usuário
        await refreshUserData();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return false;
    }
  }, [saveTokenToStorage, refreshUserData]);

  /**
   * Realiza logout do usuário
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setSessionExpiresAt(null);
    setIsSessionExpiring(false);
    clearAuthFromStorage();
  }, [clearAuthFromStorage]);

  /**
   * Tenta renovar o token imediatamente
   */
  const tryRefreshNow = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const success = await refreshToken();
      if (!success) {
        logout();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshToken, logout]);

  /**
   * Realiza login do usuário
   */
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authenticationService.login(username, password);
      
      if (response.token || response.accessToken) {
        const authToken = response.token || response.accessToken;
        setToken(authToken);
        saveTokenToStorage(authToken);
        
        // Buscar os dados completos do usuário para pegar o role
        const userDetails = await userManagementService.getUserById(response.id);
        
        // Validar se o usuário tem role permitido (admin, user ou moderator)
        console.log('User role validation:', {
          username: userDetails.username,
          role: userDetails.role,
          allowedRoles: ['admin', 'user', 'moderator']
        });
        
        if (userDetails.role !== 'admin' && userDetails.role !== 'user' && userDetails.role !== 'moderator') {
          console.log('Role validation failed:', userDetails.role);
          
          // Limpar dados de autenticação
          setToken(null);
          clearAuthFromStorage();
          
          // Lançar erro específico para role não permitido
          const roleError = new Error('Usuário não cadastrado no sistema');
          roleError.name = 'RoleValidationError';
          throw roleError;
        }
        
        console.log('Role validation passed:', userDetails.role);
        
        const userData: AuthenticatedUser = {
          id: userDetails.id,
          username: userDetails.username,
          email: userDetails.email,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          gender: userDetails.gender,
          image: userDetails.image || userDetails.profileImageUrl,
          role: userDetails.role,
          token: authToken,
        };
        
        setUser(userData);
        saveUserToStorage(userData);
        
        // Calcular expiração da sessão (assumindo 24 horas)
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
        setSessionExpiresAt(expirationTime);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  }, [saveTokenToStorage, saveUserToStorage, clearAuthFromStorage]);

  /**
   * Verifica se a sessão está expirando
   */
  const checkSessionExpiration = useCallback(() => {
    if (!sessionExpiresAt) return;
    
    const timeUntilExpiration = sessionExpiresAt - Date.now();
    const isExpiring = timeUntilExpiration <= AUTH_CONFIG.sessionExpirationBuffer;
    
    setIsSessionExpiring(isExpiring);
    
    if (timeUntilExpiration <= 0) {
      logout();
    }
  }, [sessionExpiresAt, logout]);

  /**
   * Inicializa a autenticação
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = loadUserFromStorage();
        const storedToken = loadTokenFromStorage();
        
        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
          await validateToken();
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [loadUserFromStorage, loadTokenFromStorage, validateToken]);

  /**
   * Verifica expiração da sessão periodicamente
   */
  useEffect(() => {
    const interval = setInterval(checkSessionExpiration, AUTH_CONFIG.refreshCheckInterval);
    return () => clearInterval(interval);
  }, [checkSessionExpiration]);

  /**
   * Tenta renovar token quando a sessão está expirando
   */
  useEffect(() => {
    if (isSessionExpiring && !isRefreshing) {
      tryRefreshNow();
    }
  }, [isSessionExpiring, isRefreshing, tryRefreshNow]);

  // Valor do contexto
  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    loading,
    refreshUserData,
    refreshToken,
    sessionExpiresAt,
    isRefreshing,
    isSessionExpiring,
    tryRefreshNow,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};