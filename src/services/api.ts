import axios from 'axios';

interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: string;
  image: string;
  role: string;
}

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
      // Verificar se é uma requisição de refresh token
      const isRefreshRequest = error.config?.url?.includes('/auth/refresh');
      
      if (!isRefreshRequest) {
        // Apenas redirecionar para login se NÃO for uma tentativa de refresh
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionExpiresAt');
        window.location.href = '/login';
      } else {
      }
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
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken,
        expiresInMins: 10 // 10 minutos
      });
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

  getUserById: async (id: number) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      throw error;
    }
  },

  // Buscar todos os usuários
  getUsers: async (limit: number = 30, skip: number = 0) => {
    try {
      const response = await api.get(`/users?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter lista de usuários:', error);
      throw error;
    }
  },

  // Buscar todos os usuários (sem paginação da API)
  getAllUsers: async () => {
    try {
      // A API DummyJSON retorna 208 usuários no total
      // Vamos buscar em lotes de 100 para obter todos os usuários
      const allUsers: UserData[] = [];
      let skip = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await api.get(`/users?limit=${limit}&skip=${skip}`);
        const data = response.data;
        
        if (data.users && data.users.length > 0) {
          allUsers.push(...data.users);
          skip += limit;
          
          // Se retornou menos que o limite, chegamos ao fim
          if (data.users.length < limit) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      return {
        users: allUsers,
        total: allUsers.length,
        skip: 0,
        limit: allUsers.length
      };
    } catch (error) {
      console.error('Erro ao obter todos os usuários:', error);
      throw error;
    }
  },

  // Adicionar novo usuário
  addUser: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    role?: string;
  }) => {
    try {
      const response = await api.post('/users/add', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      throw error;
    }
  },

  // Atualizar usuário
  updateUser: async (id: number, userData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    age?: number;
    gender?: string;
    role?: string;
  }) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  // Excluir usuário
  deleteUser: async (id: number) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  },
};



export default api;
