'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Card, Typography, Space, Avatar, Table, Tag, Spin, Row, Col, Statistic, Button, Badge, Tooltip, Modal, message, Form, Input, Select, InputNumber } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined,
  TeamOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import type { ColumnsType } from 'antd/es/table';

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
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
    moderators: 0
  });
  
  // Estados para modais
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [form] = Form.useForm();

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Buscar usuários quando o componente carregar
  useEffect(() => {
    // Função para filtrar usuários baseado no role do usuário logado
    const filterUsersByRole = (usersData: UserData[]) => {
      if (!user?.role) return usersData;
      
      // Admin pode ver todos os usuários
      if (user.role === 'admin') {
        return usersData;
      }
      
      // User só pode ver outros users
      if (user.role === 'user') {
        return usersData.filter((userData: UserData) => userData.role === 'user');
      }
      
      return usersData;
    };

    const fetchUsers = async () => {
      if (isAuthenticated) {
        setUsersLoading(true);
        try {
          // Buscar todos os usuários (100 é o limite máximo da API)
          const response = await authService.getUsers(100, 0);
          const usersData = response.users || [];
          
          // Filtrar usuários baseado no role do usuário logado
          const filteredData = filterUsersByRole(usersData);
          setFilteredUsers(filteredData);
          setTotalUsers(filteredData.length);
          
          // Calcular estatísticas apenas dos usuários visíveis
          const newStats = {
            total: filteredData.length,
            admins: filteredData.filter((userData: UserData) => userData.role === 'admin').length,
            users: filteredData.filter((userData: UserData) => userData.role === 'user').length,
            moderators: filteredData.filter((userData: UserData) => userData.role === 'moderator').length
          };
          setStats(newStats);
        } catch (error) {
          console.error('Erro ao buscar usuários:', error);
        } finally {
          setUsersLoading(false);
        }
      }
    };

    fetchUsers();
  }, [isAuthenticated, user?.role]);

  // Função para recarregar dados
  const refreshUsers = async () => {
    if (isAuthenticated) {
      setUsersLoading(true);
      try {
        const response = await authService.getUsers(100, 0);
        const usersData = response.users || [];
        
        // Filtrar usuários baseado no role do usuário logado
        const filterUsersByRole = (usersData: UserData[]) => {
          if (!user?.role) return usersData;
          
          if (user.role === 'admin') {
            return usersData;
          }
          
          if (user.role === 'user') {
            return usersData.filter((userData: UserData) => userData.role === 'user');
          }
          
          return usersData;
        };
        
        const filteredData = filterUsersByRole(usersData);
        setFilteredUsers(filteredData);
        setTotalUsers(filteredData.length);
        
        // Calcular estatísticas apenas dos usuários visíveis
        const newStats = {
          total: filteredData.length,
          admins: filteredData.filter((userData: UserData) => userData.role === 'admin').length,
          users: filteredData.filter((userData: UserData) => userData.role === 'user').length,
          moderators: filteredData.filter((userData: UserData) => userData.role === 'moderator').length
        };
        setStats(newStats);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      } finally {
        setUsersLoading(false);
      }
    }
  };

  // Funções de ação
  const handleViewDetails = (userId: number) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const handleAddUser = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (userData: UserData) => {
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
  };

  const handleDelete = async (userId: number, userName: string) => {
    Modal.confirm({
      title: 'Confirmar Exclusão',
      content: `Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`,
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      async onOk() {
        try {
          await authService.deleteUser(userId);
          message.success(`Usuário "${userName}" excluído com sucesso!`);
          await refreshUsers();
        } catch (error) {
          message.error('Erro ao excluir usuário. Tente novamente.');
          console.error('Erro ao excluir usuário:', error);
        }
      },
    });
  };

  // Funções dos modais
  const handleAddUserSubmit = async (values: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    age: number;
    gender: string;
    role: string;
  }) => {
    try {
      await authService.addUser({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        password: values.password,
        age: values.age,
        gender: values.gender,
        role: values.role || 'user'
      });
      message.success('Usuário adicionado com sucesso!');
      setIsAddModalVisible(false);
      form.resetFields();
      await refreshUsers();
    } catch (error) {
      message.error('Erro ao adicionar usuário. Tente novamente.');
      console.error('Erro ao adicionar usuário:', error);
    }
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
    
    try {
      await authService.updateUser(editingUser.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        gender: values.gender,
        role: values.role
      });
      message.success('Usuário atualizado com sucesso!');
      setIsEditModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      await refreshUsers();
    } catch (error) {
      message.error('Erro ao atualizar usuário. Tente novamente.');
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  // Função para calcular dados da página atual
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
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

  // Configuração das colunas da tabela
  const columns: ColumnsType<UserData> = [
    {
      title: (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Usuário</span>
        </Space>
      ),
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string, record: UserData) => (
        <Space>
          <Avatar 
            size={48} 
            src={image} 
            icon={<UserOutlined />}
            style={{ 
              border: '2px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              ID: {record.id}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: (
        <Space>
          <SearchOutlined style={{ color: '#1890ff' }} />
          <span>Username</span>
        </Space>
      ),
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string) => (
        <Text code style={{ 
          background: '#f6f8fa', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          @{username}
        </Text>
      ),
      sorter: (a: UserData, b: UserData) => a.username.localeCompare(b.username),
    },
    {
      title: (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Email</span>
        </Space>
      ),
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => (
        <Tooltip title={email}>
          <Text style={{ fontSize: '13px' }}>{email}</Text>
        </Tooltip>
      ),
      sorter: (a: UserData, b: UserData) => a.email.localeCompare(b.email),
    },
    {
      title: (
        <Space>
          <FilterOutlined style={{ color: '#1890ff' }} />
          <span>Gênero</span>
        </Space>
      ),
      dataIndex: 'gender',
      key: 'gender',
      width: 120,
      render: (gender: string) => (
        <Badge 
          status={gender === 'female' ? 'processing' : 'success'} 
          text={gender === 'female' ? 'Feminino' : 'Masculino'}
        />
      ),
      filters: [
        { text: 'Feminino', value: 'female' },
        { text: 'Masculino', value: 'male' },
      ],
      onFilter: (value: boolean | React.Key, record: UserData) => record.gender === value,
    },
    {
      title: (
        <Space>
          <CrownOutlined style={{ color: '#1890ff' }} />
          <span>Role</span>
        </Space>
      ),
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: string) => {
        const roleConfig = {
          admin: { color: 'gold', icon: <CrownOutlined />, text: 'Admin' },
          user: { color: 'blue', icon: <UserOutlined />, text: 'User' },
          moderator: { color: 'red', icon: <UserOutlined />, text: 'Moderator' }
        };
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', icon: <UserOutlined />, text: role };
        
        return (
          <Tag 
            color={config.color}
            style={{ 
              borderRadius: '20px',
              padding: '4px 12px',
              fontWeight: 500,
              fontSize: '12px'
            }}
          >
            <Space size={4}>
              {config.icon}
              {config.text}
            </Space>
          </Tag>
        );
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
        { text: 'Moderator', value: 'moderator' },
      ],
      onFilter: (value: boolean | React.Key, record: UserData) => record.role === value,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record: UserData) => (
        <Space size="small">
          <Tooltip title="Ver Detalhes">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetails(record.id)}
              style={{ 
                color: '#1890ff',
                borderRadius: '6px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#f6ffed'
              }}
            />
          </Tooltip>
          {user?.role === 'admin' ? (
            <>
              <Tooltip title="Editar Usuário">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                  style={{ 
                    color: '#52c41a',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    backgroundColor: '#f6ffed'
                  }}
                />
              </Tooltip>
              <Tooltip title="Excluir Usuário">
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id, `${record.firstName} ${record.lastName}`)}
                  style={{ 
                    color: '#ff4d4f',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9',
                    backgroundColor: '#fff2f0'
                  }}
                />
              </Tooltip>
            </>
          ) : (
            <Tooltip title="Apenas administradores podem editar e excluir usuários">
              <Space size="small">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  disabled
                  style={{ 
                    color: '#d9d9d9',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                  }}
                />
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  disabled
                  style={{ 
                    color: '#d9d9d9',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                  }}
                />
              </Space>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <style jsx global>{`
        .table-row-light {
          background: #fafafa;
        }
        .table-row-dark {
          background: #fff;
        }
        .table-row-light:hover,
        .table-row-dark:hover {
          background: #e6f7ff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
          border-bottom: 2px solid #dee2e6 !important;
          font-weight: 600 !important;
          color: #495057 !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 16px !important;
        }
        .ant-pagination {
          margin-top: 24px !important;
        }
        .ant-pagination-item {
          border-radius: 8px !important;
        }
        .ant-pagination-item-active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-color: transparent !important;
        }
      `}</style>
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <Header />
        <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Estatísticas Modernas */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <Statistic
                    title={
                      <Space>
                        <TeamOutlined style={{ color: '#fff' }} />
                        <span style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                          Total de Usuários
                        </span>
                      </Space>
                    }
                    value={stats.total}
                    valueStyle={{ 
                      color: '#fff', 
                      fontSize: '32px', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <Statistic
                    title={
                      <Space>
                        <CrownOutlined style={{ color: '#fff' }} />
                        <span style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                          Administradores
                        </span>
                      </Space>
                    }
                    value={stats.admins}
                    valueStyle={{ 
                      color: '#fff', 
                      fontSize: '32px', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <Statistic
                    title={
                      <Space>
                        <UserOutlined style={{ color: '#fff' }} />
                        <span style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                          Usuários
                        </span>
                      </Space>
                    }
                    value={stats.users}
                    valueStyle={{ 
                      color: '#fff', 
                      fontSize: '32px', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <Statistic
                    title={
                      <Space>
                        <EyeOutlined style={{ color: '#fff' }} />
                        <span style={{ color: '#fff', fontSize: '16px', fontWeight: 500 }}>
                          Moderadores
                        </span>
                      </Space>
                    }
                    value={stats.moderators}
                    valueStyle={{ 
                      color: '#fff', 
                      fontSize: '32px', 
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabela de Usuários Moderna */}
            <Card 
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none',
                overflow: 'hidden'
              }}
              title={
                <Space size="large">
                  <Space>
                    <TeamOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 600 }}>
                      Lista de Usuários
                    </span>
                  </Space>
                  <Badge 
                    count={stats.total} 
                    style={{ 
                      backgroundColor: '#52c41a',
                      boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
                    }} 
                  />
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
                  >
                    Atualizar
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<ExportOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    Exportar
                  </Button>
                  {usersLoading && <Spin size="small" />}
                  </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={getCurrentPageData()}
                loading={usersLoading}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalUsers,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} de ${total} usuários`,
                  pageSizeOptions: ['10', '20', '50'],
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  onChange: (page) => {
                    setCurrentPage(page);
                  },
                  style: { marginTop: '16px' }
                }}
                scroll={{ x: 1200 }}
                size="middle"
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
                rowClassName={(record, index) => 
                  index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                }
              />
            </Card>
          </Space>
        </div>
      </Content>
    </Layout>

    {/* Modal para Adicionar Usuário */}
    <Modal
      title={
        <Space>
          <PlusOutlined style={{ color: '#52c41a' }} />
          <span>Adicionar Novo Usuário</span>
        </Space>
      }
      open={isAddModalVisible}
      onCancel={() => setIsAddModalVisible(false)}
      footer={null}
      width={600}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleAddUserSubmit}
        style={{ marginTop: '20px' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Nome"
              rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
            >
              <Input placeholder="Digite o nome" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Sobrenome"
              rules={[{ required: true, message: 'Por favor, insira o sobrenome!' }]}
            >
              <Input placeholder="Digite o sobrenome" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Por favor, insira o username!' }]}
            >
              <Input placeholder="Digite o username" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Por favor, insira o email!' },
                { type: 'email', message: 'Por favor, insira um email válido!' }
              ]}
            >
              <Input placeholder="Digite o email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Senha"
              rules={[{ required: true, message: 'Por favor, insira a senha!' }]}
            >
              <Input.Password placeholder="Digite a senha" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="age"
              label="Idade"
              rules={[{ required: true, message: 'Por favor, insira a idade!' }]}
            >
              <InputNumber 
                placeholder="Digite a idade" 
                min={1} 
                max={120} 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gênero"
              rules={[{ required: true, message: 'Por favor, selecione o gênero!' }]}
            >
              <Select placeholder="Selecione o gênero">
                <Select.Option value="male">Masculino</Select.Option>
                <Select.Option value="female">Feminino</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Por favor, selecione o role!' }]}
            >
              <Select placeholder="Selecione o role">
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="moderator">Moderator</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => setIsAddModalVisible(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none'
            }}>
              Adicionar Usuário
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>

    {/* Modal para Editar Usuário */}
    <Modal
      title={
        <Space>
          <EditOutlined style={{ color: '#52c41a' }} />
          <span>Editar Usuário</span>
        </Space>
      }
      open={isEditModalVisible}
      onCancel={() => {
        setIsEditModalVisible(false);
        setEditingUser(null);
        form.resetFields();
      }}
      footer={null}
      width={600}
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleEditUserSubmit}
        style={{ marginTop: '20px' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Nome"
              rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
            >
              <Input placeholder="Digite o nome" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Sobrenome"
              rules={[{ required: true, message: 'Por favor, insira o sobrenome!' }]}
            >
              <Input placeholder="Digite o sobrenome" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Por favor, insira o username!' }]}
            >
              <Input placeholder="Digite o username" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Por favor, insira o email!' },
                { type: 'email', message: 'Por favor, insira um email válido!' }
              ]}
            >
              <Input placeholder="Digite o email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gênero"
              rules={[{ required: true, message: 'Por favor, selecione o gênero!' }]}
            >
              <Select placeholder="Selecione o gênero">
                <Select.Option value="male">Masculino</Select.Option>
                <Select.Option value="female">Feminino</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Por favor, selecione o role!' }]}
            >
              <Select placeholder="Selecione o role">
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
                <Select.Option value="moderator">Moderator</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => {
              setIsEditModalVisible(false);
              setEditingUser(null);
              form.resetFields();
            }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none'
            }}>
              Atualizar Usuário
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
    </>
  );
}
