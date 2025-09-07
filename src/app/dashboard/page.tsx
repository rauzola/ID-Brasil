'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Layout, Card, Typography, Space, Button, Badge, Modal, Form } from 'antd';
import { 
  TeamOutlined,
  ReloadOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import UserStats from '@/components/UserStats';
import UsersTable from '@/components/UsersTable';
import UserModals from '@/components/UserModals';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';

const { Content } = Layout;
const { Text } = Typography;

// Constantes para configuração da página
const PAGE_CONFIG = {
  maxWidth: '1400px',
  padding: '24px',
  cardBorderRadius: '16px',
  cardShadow: '0 8px 32px var(--shadow-primary)',
} as const;

// Configurações de estilo para botões
const BUTTON_STYLES = {
  addButton: {
    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)',
  },
  refreshButton: {
    color: '#1890ff',
  },
} as const;

// Configurações de badge
const BADGE_STYLES = {
  backgroundColor: '#52c41a',
  boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)',
} as const;

// Interface para dados do formulário de usuário
interface UserFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  age?: number;
  gender: string;
  role: string;
}

// Interface para dados do usuário
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
 * Página principal do dashboard
 * Exibe estatísticas e lista de usuários com funcionalidades de CRUD
 */
export default function DashboardPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Estados para modais
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [form] = Form.useForm();

  // Hook personalizado para gerenciar usuários
  const {
    filteredUsers,
    usersLoading,
    loadingProgress,
    totalUsers,
    stats,
    refreshUsers,
    addUser,
    editUser,
    deleteUser
  } = useUsers(user?.role);

  /**
   * Redireciona para login se não estiver autenticado
   */
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  /**
   * Navega para página de detalhes do usuário
   */
  const handleViewUserDetails = useCallback((userId: number) => {
    router.push(`/dashboard/users/${userId}`);
  }, [router]);

  /**
   * Abre modal para adicionar novo usuário
   */
  const handleOpenAddUserModal = useCallback(() => {
    setIsAddModalVisible(true);
    form.resetFields();
  }, [form]);

  /**
   * Abre modal para editar usuário existente
   */
  const handleOpenEditUserModal = useCallback((userData: UserData) => {
    setEditingUser(userData);
    setIsEditModalVisible(true);
    form.setFieldsValue({
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      gender: userData.gender,
      role: userData.role
    });
  }, [form]);

  /**
   * Verifica se há parâmetro de edição na URL e abre modal correspondente
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editUserId = urlParams.get('edit');
    
    if (editUserId && user?.role === 'admin') {
      const userToEdit = filteredUsers.find((userData: UserData) => userData.id === parseInt(editUserId));
      if (userToEdit) {
        handleOpenEditUserModal(userToEdit);
        // Limpar o parâmetro da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [filteredUsers, user?.role, handleOpenEditUserModal]);

  /**
   * Confirma e executa exclusão do usuário
   */
  const handleDeleteUser = useCallback(async (userId: number, userName: string) => {
    Modal.confirm({
      title: 'Confirmar Exclusão',
      content: `Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`,
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      async onOk() {
        deleteUser(userId);
      },
    });
  }, [deleteUser]);

  /**
   * Processa submissão do formulário de adição de usuário
   */
  const handleAddUserFormSubmit = useCallback(async (values: UserFormData) => {
    addUser({
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      email: values.email,
      gender: values.gender,
      role: values.role || 'user'
    });
    setIsAddModalVisible(false);
    form.resetFields();
  }, [addUser, form]);

  /**
   * Processa submissão do formulário de edição de usuário
   */
  const handleEditUserFormSubmit = useCallback(async (values: UserFormData) => {
    if (!editingUser) return;
    
    editUser(editingUser.id, {
      firstName: values.firstName,
      lastName: values.lastName,
      username: values.username,
      email: values.email,
      gender: values.gender,
      role: values.role
    });
    setIsEditModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  }, [editingUser, editUser, form]);

  /**
   * Manipula mudança de página na paginação
   */
  const handlePageChange = useCallback((page: number) => {
    console.log('Page changed to:', page);
    setCurrentPage(page);
  }, []);

  /**
   * Manipula mudança de tamanho da página na paginação
   */
  const handlePageSizeChange = useCallback((current: number, size: number) => {
    console.log('Page size changed to:', size, 'from page:', current);
    setPageSize(size);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  /**
   * Calcula dados da página atual para paginação
   */
  const getCurrentPageData = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = filteredUsers.slice(startIndex, endIndex);
    
    console.log('Pagination debug:', {
      currentPage,
      pageSize,
      totalUsers: filteredUsers.length,
      startIndex,
      endIndex,
      pageDataLength: pageData.length
    });
    
    return pageData;
  }, [filteredUsers, currentPage, pageSize]);


  /**
   * Fecha modal de adição e limpa formulário
   */
  const handleCloseAddModal = useCallback(() => {
    setIsAddModalVisible(false);
    form.resetFields();
  }, [form]);

  /**
   * Fecha modal de edição e limpa formulário
   */
  const handleCloseEditModal = useCallback(() => {
    setIsEditModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  }, [form]);

  /**
   * Renderiza loading spinner
   */
  const renderLoadingSpinner = useCallback(() => (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
      <Content style={{ padding: PAGE_CONFIG.padding }}>
          <LoadingSpinner tip="Carregando dashboard..." />
        </Content>
      </Layout>
  ), []);

  /**
   * Renderiza cabeçalho da tabela de usuários
   */
  const renderTableHeader = useCallback(() => (
    <Space size="large">
      <Space>
        <TeamOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
        <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Lista de Usuários
        </span>
      </Space>
      <Space>
        <Badge 
          count={stats.totalUsers} 
          style={BADGE_STYLES} 
        />
        <Text type="secondary" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {stats.totalUsers === 0 ? 'Carregando usuários...' : `${stats.totalUsers} usuários carregados`}
        </Text>
      </Space>
    </Space>
  ), [stats.totalUsers]);

  /**
   * Renderiza ações da tabela de usuários
   */
  const renderTableActions = useCallback(() => (
    <Space>
      {user?.role === 'admin' && (
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleOpenAddUserModal}
          style={BUTTON_STYLES.addButton}
        >
          Adicionar Usuário
        </Button>
      )}
      <Button 
        type="text" 
        icon={<ReloadOutlined />}
        onClick={refreshUsers}
        style={BUTTON_STYLES.refreshButton}
        loading={usersLoading}
      >
        {usersLoading ? `Carregando... ${loadingProgress}%` : 'Atualizar'}
      </Button>
      {/* Botão de debug temporário */}
      <Button 
        type="dashed" 
        onClick={() => {
          console.log('Current filtered users:', filteredUsers);
          console.log('Total users count:', totalUsers);
          console.log('Stats:', stats);
        }}
        style={{ fontSize: '12px' }}
      >
        Debug
      </Button>
    </Space>
  ), [user?.role, handleOpenAddUserModal, refreshUsers, usersLoading, loadingProgress, filteredUsers, totalUsers, stats]);

  // Estados de loading
  if (loading) {
    return renderLoadingSpinner();
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Header />
      <Content style={{ padding: PAGE_CONFIG.padding }}>
        <div style={{ maxWidth: PAGE_CONFIG.maxWidth, margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Estatísticas dos usuários */}
            <UserStats stats={{
              total: stats.totalUsers,
              admins: stats.adminUsers,
              users: stats.regularUsers,
              moderators: stats.moderatorUsers
            }} />

            {/* Tabela de usuários */}
            <Card 
              className="gradient-card"
              style={{
                borderRadius: PAGE_CONFIG.cardBorderRadius,
                boxShadow: PAGE_CONFIG.cardShadow,
                border: 'none',
                overflow: 'hidden',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)'
              }}
              title={renderTableHeader()}
              extra={renderTableActions()}
            >
              <UsersTable
                users={getCurrentPageData()}
                loading={usersLoading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalUsers={totalUsers}
                userRole={user?.role}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onViewDetails={handleViewUserDetails}
                onEdit={handleOpenEditUserModal}
                onDelete={handleDeleteUser}
              />
            </Card>
          </Space>
        </div>
      </Content>

      {/* Modais de usuário */}
      <UserModals
        isAddModalVisible={isAddModalVisible}
        isEditModalVisible={isEditModalVisible}
        form={form}
        onAddModalClose={handleCloseAddModal}
        onEditModalClose={handleCloseEditModal}
        onAddUserSubmit={handleAddUserFormSubmit}
        onEditUserSubmit={handleEditUserFormSubmit}
      />
    </Layout>
  );
}