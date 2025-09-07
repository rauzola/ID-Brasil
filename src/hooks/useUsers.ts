import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { authService } from '@/services/api';

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

interface UserStats {
  total: number;
  admins: number;
  users: number;
  moderators: number;
}

export function useUsers(userRole?: string) {
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    users: 0,
    moderators: 0
  });

  // Função para carregar dados do localStorage
  const loadUsersFromLocalStorage = (): UserData[] => {
    try {
      const stored = localStorage.getItem('users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar usuários do localStorage:', error);
      return [];
    }
  };

  // Função para salvar dados no localStorage
  const saveUsersToLocalStorage = (users: UserData[]) => {
    try {
      localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários no localStorage:', error);
    }
  };

  // Função para gerar ID único
  const generateId = (): number => {
    return Date.now() + Math.floor(Math.random() * 1000);
  };

  // Função para filtrar usuários baseado no role do usuário logado
  const filterUsersByRole = useCallback((usersData: UserData[]) => {
    if (!userRole) return usersData;
    
    // Admin pode ver todos os usuários
    if (userRole === 'admin') {
      return usersData;
    }
    
    // User só pode ver outros users
    if (userRole === 'user') {
      return usersData.filter((userData: UserData) => userData.role === 'user');
    }
    
    return usersData;
  }, [userRole]);

  // Função para calcular estatísticas
  const calculateStats = useCallback((usersData: UserData[]) => {
    return {
      total: usersData.length,
      admins: usersData.filter((userData: UserData) => userData.role === 'admin').length,
      users: usersData.filter((userData: UserData) => userData.role === 'user').length,
      moderators: usersData.filter((userData: UserData) => userData.role === 'moderator').length
    };
  }, []);

  // Função para buscar usuários
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setLoadingProgress(0);
    try {
      // Primeiro, tentar carregar do localStorage
      let usersData = loadUsersFromLocalStorage();
      
      // Se não há dados no localStorage, buscar da API
      if (usersData.length === 0) {
        setLoadingProgress(25);
        const response = await authService.getAllUsers();
        setLoadingProgress(75);
        usersData = response.users || [];
        // Salvar no localStorage para uso futuro
        saveUsersToLocalStorage(usersData);
        setLoadingProgress(90);
      }
      
      // Filtrar usuários baseado no role do usuário logado
      const filteredData = filterUsersByRole(usersData);
      setFilteredUsers(filteredData);
      setTotalUsers(filteredData.length);
      
      // Calcular estatísticas apenas dos usuários visíveis
      const newStats = calculateStats(filteredData);
      setStats(newStats);
      setLoadingProgress(100);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // Em caso de erro, tentar carregar do localStorage
      const usersData = loadUsersFromLocalStorage();
      const filteredData = filterUsersByRole(usersData);
      setFilteredUsers(filteredData);
      setTotalUsers(filteredData.length);
      const newStats = calculateStats(filteredData);
      setStats(newStats);
    } finally {
      setUsersLoading(false);
      setLoadingProgress(0);
    }
  }, [filterUsersByRole, calculateStats]);

  // Função para recarregar dados
  const refreshUsers = useCallback(async () => {
    setUsersLoading(true);
    setLoadingProgress(0);
    try {
      // Buscar da API e atualizar localStorage
      setLoadingProgress(25);
      const response = await authService.getAllUsers();
      setLoadingProgress(75);
      const usersData = response.users || [];
      saveUsersToLocalStorage(usersData);
      setLoadingProgress(90);
      
      // Filtrar usuários baseado no role do usuário logado
      const filteredData = filterUsersByRole(usersData);
      setFilteredUsers(filteredData);
      setTotalUsers(filteredData.length);
      
      // Calcular estatísticas apenas dos usuários visíveis
      const newStats = calculateStats(filteredData);
      setStats(newStats);
      setLoadingProgress(100);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // Em caso de erro, carregar do localStorage
      const usersData = loadUsersFromLocalStorage();
      const filteredData = filterUsersByRole(usersData);
      setFilteredUsers(filteredData);
      setTotalUsers(filteredData.length);
      const newStats = calculateStats(filteredData);
      setStats(newStats);
    } finally {
      setUsersLoading(false);
      setLoadingProgress(0);
    }
  }, [filterUsersByRole, calculateStats]);

  // Função para adicionar avatar de usuário
  const addUser = useCallback((userData: Omit<UserData, 'id' | 'image'>) => {
    const newUser: UserData = {
      id: generateId(),
      ...userData,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
    };

    // Adicionar ao localStorage
    const currentUsers = loadUsersFromLocalStorage();
    const updatedUsers = [...currentUsers, newUser];
    saveUsersToLocalStorage(updatedUsers);

    // Atualizar estado local
    const filteredData = filterUsersByRole(updatedUsers);
    setFilteredUsers(filteredData);
    setTotalUsers(filteredData.length);
    
    // Atualizar estatísticas
    const newStats = calculateStats(filteredData);
    setStats(newStats);

    message.success('Usuário adicionado com sucesso!');
  }, [filterUsersByRole, calculateStats]);

  // Função para editar usuário
  const editUser = useCallback((userId: number, userData: Partial<UserData>) => {
    // Atualizar no localStorage
    const currentUsers = loadUsersFromLocalStorage();
    const updatedUsers = currentUsers.map(user => 
      user.id === userId 
        ? { ...user, ...userData }
        : user
    );
    saveUsersToLocalStorage(updatedUsers);

    // Atualizar estado local
    const filteredData = filterUsersByRole(updatedUsers);
    setFilteredUsers(filteredData);
    setTotalUsers(filteredData.length);
    
    // Atualizar estatísticas
    const newStats = calculateStats(filteredData);
    setStats(newStats);

    message.success('Usuário atualizado com sucesso!');
  }, [filterUsersByRole, calculateStats]);

  // Função para excluir usuário
  const deleteUser = useCallback((userId: number) => {
    // Remover do localStorage
    const currentUsers = loadUsersFromLocalStorage();
    const updatedUsers = currentUsers.filter(user => user.id !== userId);
    saveUsersToLocalStorage(updatedUsers);
    
    // Atualizar estado local
    const filteredData = filterUsersByRole(updatedUsers);
    setFilteredUsers(filteredData);
    setTotalUsers(filteredData.length);
    
    // Atualizar estatísticas
    const newStats = calculateStats(filteredData);
    setStats(newStats);

    message.success('Usuário excluído com sucesso!');
  }, [filterUsersByRole, calculateStats]);

  // Carregar usuários quando o hook for inicializado
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    filteredUsers,
    usersLoading,
    loadingProgress,
    totalUsers,
    stats,
    fetchUsers,
    refreshUsers,
    addUser,
    editUser,
    deleteUser,
    generateId
  };
}
