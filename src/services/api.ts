import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  UserDetailedInfo, 
  UserFormData, 
  UsersApiResponse,
  UserOperationResponse 
} from '@/types/user';

// Configurações da API
const API_CONFIG = {
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// Configurações de autenticação
const AUTH_CONFIG = {
  tokenKey: 'token',
  refreshEndpoint: '/auth/refresh',
} as const;

// Instância do cliente HTTP
const httpClient: AxiosInstance = axios.create(API_CONFIG);

/**
 * Interceptor de requisições
 * Adiciona token de autenticação automaticamente
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authToken = localStorage.getItem(AUTH_CONFIG.tokenKey);
    if (authToken && config.headers) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respostas
 * Trata erros globais e redirecionamentos
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      handleUnauthorizedError(error);
    } else if (error.response?.status === 403) {
      console.error('Acesso negado:', error.response.data);
    } else if (error.response?.status >= 500) {
      console.error('Erro interno do servidor:', error.response.data);
    } else if (!error.response) {
      console.error('Erro de rede:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Trata erros de autorização (401)
 */
const handleUnauthorizedError = (error: unknown) => {
  const axiosError = error as { config?: { url?: string } };
  const isRefreshRequest = axiosError.config?.url?.includes(AUTH_CONFIG.refreshEndpoint);
  
  if (!isRefreshRequest) {
    // Limpar dados de autenticação
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem('user');
    
    // Redirecionar para login se não estiver na página de login
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
};

/**
 * Trata erros da API de forma consistente
 */
const handleApiError = (error: unknown, operation: string) => {
  console.error(`Erro na operação ${operation}:`, error);
  
  const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
  
  if (axiosError.response?.data?.message) {
    throw new Error(axiosError.response.data.message);
  } else if (axiosError.message) {
    throw new Error(axiosError.message);
  } else {
    throw new Error(`Erro na operação ${operation}`);
  }
};

/**
 * Serviço de autenticação
 * Gerencia login, logout e operações relacionadas à autenticação
 */
export const authenticationService = {
  /**
   * Realiza login do usuário
   */
  login: async (username: string, password: string) => {
    try {
      const response = await httpClient.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'login');
    }
  },

  /**
   * Obtém dados do usuário atual
   */
  getCurrentUser: async (): Promise<UserDetailedInfo> => {
    try {
      const response = await httpClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getCurrentUser');
    }
  },

  /**
   * Renova o token de autenticação
   */
  refreshAuthenticationToken: async () => {
    try {
      const response = await httpClient.post(AUTH_CONFIG.refreshEndpoint);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'refreshToken');
    }
  },
};

/**
 * Serviço de gerenciamento de usuários
 * Gerencia operações CRUD de usuários
 */
export const userManagementService = {
  /**
   * Obtém um usuário por ID
   */
  getUserById: async (userId: number): Promise<UserDetailedInfo> => {
    try {
      const response = await httpClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getUserById');
    }
  },

  /**
   * Obtém todos os usuários
   */
  getAllUsers: async (): Promise<UsersApiResponse> => {
    try {
      // Usar limit=0 para obter todos os usuários da API dummyjson
      const response = await httpClient.get('/users?limit=0');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'getAllUsers');
    }
  },

  /**
   * Cria um novo usuário
   */
  createUser: async (userData: UserFormData): Promise<UserOperationResponse> => {
    try {
      const response = await httpClient.post('/users/add', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'createUser');
    }
  },

  /**
   * Atualiza um usuário existente
   */
  updateUser: async (userId: number, userData: Partial<UserFormData>): Promise<UserOperationResponse> => {
    try {
      const response = await httpClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updateUser');
    }
  },

  /**
   * Remove um usuário
   */
  deleteUser: async (userId: number): Promise<UserOperationResponse> => {
    try {
      const response = await httpClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleteUser');
    }
  },
};

// Aliases para compatibilidade com código existente
/**
 * @deprecated Use authenticationService instead
 */
export const authService = authenticationService;

/**
 * @deprecated Use userManagementService instead
 */
export const userService = userManagementService;

/**
 * @deprecated Use httpClient instead
 */
export const api = httpClient;