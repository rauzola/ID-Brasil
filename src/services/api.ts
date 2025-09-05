import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      // Limpar token e redirecionar para login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  // Login
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        expiresInMins: 30, // Token expira em 30 minutos
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown; status?: number }; message?: string; status?: number };
      const errorMessage = axiosError.response?.data || axiosError.message || 'Erro desconhecido';
      const statusCode = axiosError.response?.status || axiosError.status;
      
      console.error('Erro no login:', {
        message: errorMessage,
        status: statusCode,
        fullError: error
      });
      throw error;
    }
  },

  // Obter dados do usuário atual
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown; status?: number }; message?: string; status?: number };
      const errorMessage = axiosError.response?.data || axiosError.message || 'Erro desconhecido';
      const statusCode = axiosError.response?.status || axiosError.status;
      
      console.error('Erro ao obter dados do usuário:', {
        message: errorMessage,
        status: statusCode,
        fullError: error
      });
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: unknown; status?: number }; message?: string; status?: number };
      const errorMessage = axiosError.response?.data || axiosError.message || 'Erro desconhecido';
      const statusCode = axiosError.response?.status || axiosError.status;
      
      console.error('Erro ao renovar token:', {
        message: errorMessage,
        status: statusCode,
        fullError: error
      });
      throw error;
    }
  },
};

export default api;
