'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    // Verificar se há dados de autenticação salvos
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Validar token com a API
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      // Token inválido, limpar dados
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Iniciando login para', username);
      const response = await authService.login(username, password);
      console.log('AuthContext: Resposta da API:', response);
      
      // A API DummyJSON retorna 'token' no response, vamos verificar se existe
      if (response.token || response.accessToken) {
        const token = response.token || response.accessToken;
        console.log('AuthContext: Token encontrado:', token ? 'Sim' : 'Não');
        
        setUser(response);
        setToken(token);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response));
        
        console.log('AuthContext: Login bem-sucedido');
        return true;
      }
      
      console.log('AuthContext: Nenhum token encontrado na resposta');
      return false;
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUserData = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  const isAuthenticated = !!user && !!token;

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
