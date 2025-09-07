import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { userManagementService } from '@/services/api';
import { UserRole, UserStatistics } from '@/types/user';

// Configurações do hook
const STORAGE_CONFIG = {
  usersKey: 'users',
  cacheExpirationKey: 'usersCacheExpiration',
  cacheExpirationTime: 5 * 60 * 1000, // 5 minutos
} as const;

const LOADING_CONFIG = {
  progressInterval: 100,
  maxProgress: 100,
} as const;

// Interface para dados do usuário (compatibilidade com componentes existentes)
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

/**
 * Hook personalizado para gerenciar usuários
 * Fornece funcionalidades de CRUD, cache e filtros baseados em roles
 */
export function useUsers(currentUserRole?: UserRole) {
  // Estados principais
  const [filteredUsersList, setFilteredUsersList] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [loadingProgressPercentage, setLoadingProgressPercentage] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [userStatistics, setUserStatistics] = useState<UserStatistics>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    moderatorUsers: 0
  });

  /**
   * Carrega usuários do cache local
   */
  const loadUsersFromCache = useCallback((): UserData[] => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_CONFIG.usersKey);
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (error) {
      console.error('Erro ao carregar usuários do cache:', error);
      return [];
    }
  }, []);

  /**
   * Salva usuários no cache local
   */
  const saveUsersToCache = useCallback((users: UserData[]): void => {
    try {
      localStorage.setItem(STORAGE_CONFIG.usersKey, JSON.stringify(users));
      localStorage.setItem(STORAGE_CONFIG.cacheExpirationKey, Date.now().toString());
    } catch (error) {
      console.error('Erro ao salvar usuários no cache:', error);
    }
  }, []);

  /**
   * Limpa o cache de usuários
   */
  const clearUsersCache = useCallback((): void => {
    try {
      localStorage.removeItem(STORAGE_CONFIG.usersKey);
      localStorage.removeItem(STORAGE_CONFIG.cacheExpirationKey);
    } catch (error) {
      console.error('Erro ao limpar cache de usuários:', error);
    }
  }, []);

  /**
   * Verifica se o cache está expirado
   */
  const isCacheExpired = useCallback((): boolean => {
    try {
      const expirationTime = localStorage.getItem(STORAGE_CONFIG.cacheExpirationKey);
      if (!expirationTime) return true;
      
      const timeSinceCache = Date.now() - parseInt(expirationTime);
      return timeSinceCache > STORAGE_CONFIG.cacheExpirationTime;
    } catch (error) {
      console.error('Erro ao verificar expiração do cache:', error);
      return true;
    }
  }, []);

  /**
   * Gera um ID único para novos usuários
   */
  const generateUniqueUserId = useCallback((): number => {
    const existingUsers = loadUsersFromCache();
    const maxId = existingUsers.reduce((max, user) => Math.max(max, user.id), 0);
    return maxId + 1;
  }, [loadUsersFromCache]);

  /**
   * Filtra usuários baseado no role do usuário atual
   */
  const filterUsersByCurrentUserRole = useCallback((usersData: UserData[]): UserData[] => {
    if (!currentUserRole) return usersData;
    
    // Admins podem ver todos os usuários
    if (currentUserRole === 'admin') return usersData;
    
    // Outros roles só podem ver usuários com role 'user'
    return usersData.filter(user => user.role === 'user');
  }, [currentUserRole]);

  /**
   * Calcula estatísticas dos usuários
   */
  const calculateUserStatistics = useCallback((usersData: UserData[]): UserStatistics => {
    return usersData.reduce((stats, user) => {
      stats.totalUsers++;
      
      switch (user.role) {
        case 'admin':
          stats.adminUsers++;
          break;
        case 'user':
          stats.regularUsers++;
          break;
        case 'moderator':
          stats.moderatorUsers++;
          break;
      }
      
      return stats;
    }, {
      totalUsers: 0,
      adminUsers: 0,
      regularUsers: 0,
      moderatorUsers: 0
    });
  }, []);

  /**
   * Busca usuários da API ou cache
   */
  const fetchUsersFromApiOrCache = useCallback(async (): Promise<void> => {
    setIsLoadingUsers(true);
    setLoadingProgressPercentage(0);

    try {
      // Verificar cache primeiro
      if (!isCacheExpired()) {
        const cachedUsers = loadUsersFromCache();
        if (cachedUsers.length > 0) {
          const filteredUsers = filterUsersByCurrentUserRole(cachedUsers);
          const statistics = calculateUserStatistics(filteredUsers);
          
          setFilteredUsersList(filteredUsers);
          setTotalUsersCount(filteredUsers.length);
          setUserStatistics(statistics);
          setIsLoadingUsers(false);
          return;
        }
      }

      // Simular progresso de carregamento
      const progressInterval = setInterval(() => {
        setLoadingProgressPercentage(prev => {
          if (prev >= LOADING_CONFIG.maxProgress) {
            clearInterval(progressInterval);
            return LOADING_CONFIG.maxProgress;
          }
          return prev + 10;
        });
      }, LOADING_CONFIG.progressInterval);

      // Buscar da API
      const response = await userManagementService.getAllUsers();
      const apiUsers = response.users || [];
      
      console.log('API Response:', response);
      console.log('Total users from API:', apiUsers.length);
      
      // Converter para o formato local
      const usersData: UserData[] = apiUsers.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        gender: user.gender,
        image: user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        role: user.role || 'user',
      }));
      
      console.log('Converted users:', usersData.length);
      
      // Salvar no cache
      saveUsersToCache(usersData);
      
      // Filtrar e processar dados
      const filteredUsers = filterUsersByCurrentUserRole(usersData);
      const statistics = calculateUserStatistics(filteredUsers);
      
      console.log('Filtered users:', filteredUsers.length);
      console.log('Current user role:', currentUserRole);
      console.log('Statistics:', statistics);
      
      setFilteredUsersList(filteredUsers);
      setTotalUsersCount(filteredUsers.length);
      setUserStatistics(statistics);
      
      clearInterval(progressInterval);
      setLoadingProgressPercentage(LOADING_CONFIG.maxProgress);
      
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      message.error('Erro ao carregar usuários');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [isCacheExpired, loadUsersFromCache, filterUsersByCurrentUserRole, calculateUserStatistics, saveUsersToCache, currentUserRole]);

  /**
   * Atualiza usuários da API (ignora cache)
   */
  const refreshUsersFromApi = useCallback(async (): Promise<void> => {
    console.log('Refreshing users from API...');
    clearUsersCache();
    await fetchUsersFromApiOrCache();
  }, [clearUsersCache, fetchUsersFromApiOrCache]);

  /**
   * Adiciona um novo usuário
   */
  const createNewUser = useCallback((userData: Omit<UserData, 'id' | 'image'>) => {
    try {
    const newUser: UserData = {
      ...userData,
        id: generateUniqueUserId(),
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
    };

      const existingUsers = loadUsersFromCache();
      const updatedUsers = [...existingUsers, newUser];
      
      saveUsersToCache(updatedUsers);
      
      const filteredUsers = filterUsersByCurrentUserRole(updatedUsers);
      const statistics = calculateUserStatistics(filteredUsers);
      
      setFilteredUsersList(filteredUsers);
      setTotalUsersCount(filteredUsers.length);
      setUserStatistics(statistics);
      
      message.success(`Usuário "${newUser.firstName} ${newUser.lastName}" adicionado com sucesso!`);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      message.error('Erro ao adicionar usuário');
    }
  }, [generateUniqueUserId, loadUsersFromCache, saveUsersToCache, filterUsersByCurrentUserRole, calculateUserStatistics]);

  /**
   * Atualiza um usuário existente
   */
  const updateExistingUser = useCallback((userId: number, userData: Partial<UserData>) => {
    try {
      const existingUsers = loadUsersFromCache();
      const userIndex = existingUsers.findIndex(user => user.id === userId);
      
      if (userIndex === -1) {
        message.error('Usuário não encontrado');
        return;
      }

      const updatedUsers = [...existingUsers];
      updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...userData };
      
      saveUsersToCache(updatedUsers);
      
      const filteredUsers = filterUsersByCurrentUserRole(updatedUsers);
      const statistics = calculateUserStatistics(filteredUsers);
      
      setFilteredUsersList(filteredUsers);
      setTotalUsersCount(filteredUsers.length);
      setUserStatistics(statistics);
      
      message.success(`Usuário "${userData.firstName || existingUsers[userIndex].firstName} ${userData.lastName || existingUsers[userIndex].lastName}" atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      message.error('Erro ao atualizar usuário');
    }
  }, [loadUsersFromCache, saveUsersToCache, filterUsersByCurrentUserRole, calculateUserStatistics]);

  /**
   * Remove um usuário
   */
  const removeUser = useCallback((userId: number) => {
    try {
      const existingUsers = loadUsersFromCache();
      const userToDelete = existingUsers.find(user => user.id === userId);
      
      if (!userToDelete) {
        message.error('Usuário não encontrado');
        return;
      }

      const updatedUsers = existingUsers.filter(user => user.id !== userId);
      saveUsersToCache(updatedUsers);
      
      const filteredUsers = filterUsersByCurrentUserRole(updatedUsers);
      const statistics = calculateUserStatistics(filteredUsers);
      
      setFilteredUsersList(filteredUsers);
      setTotalUsersCount(filteredUsers.length);
      setUserStatistics(statistics);
      
      message.success(`Usuário "${userToDelete.firstName} ${userToDelete.lastName}" removido com sucesso!`);
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      message.error('Erro ao remover usuário');
    }
  }, [loadUsersFromCache, saveUsersToCache, filterUsersByCurrentUserRole, calculateUserStatistics]);

  // Carregar usuários na inicialização
  useEffect(() => {
    fetchUsersFromApiOrCache();
  }, [fetchUsersFromApiOrCache]);

  return {
    // Estados
    filteredUsers: filteredUsersList,
    usersLoading: isLoadingUsers,
    loadingProgress: loadingProgressPercentage,
    totalUsers: totalUsersCount,
    stats: userStatistics,
    
    // Ações
    fetchUsers: fetchUsersFromApiOrCache,
    refreshUsers: refreshUsersFromApi,
    addUser: createNewUser,
    editUser: updateExistingUser,
    deleteUser: removeUser,
    generateId: generateUniqueUserId,
    clearCache: clearUsersCache,
  };
}