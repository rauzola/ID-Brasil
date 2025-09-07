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

export default function DashboardPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
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


  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Funções de ação
  const handleViewDetails = (userId: number) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleAddUser = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  const handleEdit = useCallback((userData: UserData) => {
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

  // Verificar se há parâmetro de edição na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editUserId = urlParams.get('edit');
    if (editUserId && user?.role === 'admin') {
      const userToEdit = filteredUsers.find(user => user.id === parseInt(editUserId));
      if (userToEdit) {
        handleEdit(userToEdit);
        // Limpar o parâmetro da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [filteredUsers, user?.role, handleEdit]);

  const handleDelete = async (userId: number, userName: string) => {
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
  };

  // Funções dos modais
  const handleAddUserSubmit = async (values: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password?: string;
    age?: number;
    gender: string;
    role: string;
  }) => {
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
  };

  const handleEditUserSubmit = async (values: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    gender: string;
    role: string;
  }) => {
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
  };

  // Função para calcular dados da página atual
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  };

  // Handlers para paginação
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Handlers para modais
  const handleAddModalClose = () => {
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px' }}>
          <LoadingSpinner tip="Carregando dashboard..." />
        </Content>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Estatísticas */}
            <UserStats stats={stats} />

            {/* Tabela de Usuários */}
            <Card 
              className="gradient-card"
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px var(--shadow-primary)',
                border: 'none',
                overflow: 'hidden',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-primary)'
              }}
              title={
                <Space size="large">
                  <Space>
                    <TeamOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Lista de Usuários
                    </span>
                  </Space>
                  <Space>
                    <Badge 
                      count={stats.total} 
                      style={{ 
                        backgroundColor: '#52c41a',
                        boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                      }} 
                    />
                    <Text type="secondary" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {stats.total === 0 ? 'Carregando usuários...' : `${stats.total} usuários carregados`}
                    </Text>
                  </Space>
                </Space>
              } 
              extra={
                <Space>
                  {user?.role === 'admin' && (
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />}
                      onClick={handleAddUser}
                      style={{
                        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)'
                      }}
                    >
                      Adicionar Usuário
                    </Button>
                  )}
                  <Button 
                    type="text" 
                    icon={<ReloadOutlined />}
                    onClick={refreshUsers}
                    style={{ color: '#1890ff' }}
                    loading={usersLoading}
                  >
                    {usersLoading ? `Carregando... ${loadingProgress}%` : 'Atualizar'}
                  </Button>
                </Space>
              }
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
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Card>
          </Space>
        </div>
      </Content>

      {/* Modais */}
      <UserModals
        isAddModalVisible={isAddModalVisible}
        isEditModalVisible={isEditModalVisible}
        form={form}
        onAddModalClose={handleAddModalClose}
        onEditModalClose={handleEditModalClose}
        onAddUserSubmit={handleAddUserSubmit}
        onEditUserSubmit={handleEditUserSubmit}
      />
    </Layout>
  );
}
