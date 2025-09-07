'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Card, Typography, Space, Avatar, Button, Row, Col, Descriptions, Tag, Badge, message, Modal } from 'antd';
import { 
  UserOutlined, 
  CrownOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  BankOutlined,
  TeamOutlined
} from '@ant-design/icons';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { authService } from '@/services/api';

const { Content } = Layout;
const { Title, Text } = Typography;

interface UserDetails {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender: string;
  image: string;
  role: string;
  age?: number;
  birthDate?: string;
  phone?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  hair?: {
    color?: string;
    type?: string;
  };
  address?: {
    address?: string;
    city?: string;
    state?: string;
    stateCode?: string;
    postalCode?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
    country?: string;
  };
  bank?: {
    cardExpire?: string;
    cardNumber?: string;
    cardType?: string;
    currency?: string;
    iban?: string;
  };
  company?: {
    department?: string;
    name?: string;
    title?: string;
    address?: {
      address?: string;
      city?: string;
      state?: string;
      stateCode?: string;
      postalCode?: string;
      coordinates?: {
        lat?: number;
        lng?: number;
      };
      country?: string;
    };
  };
}

export default function UserDetailsPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Buscar detalhes do usuário
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isAuthenticated && userId) {
        setLoadingDetails(true);
        try {
          // Primeiro, tentar buscar do localStorage
          const storedUsers = localStorage.getItem('users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const user = users.find((u: UserDetails) => u.id === parseInt(userId));
            if (user) {
              setUserDetails(user);
              setLoadingDetails(false);
              return;
            }
          }
          
          // Se não encontrou no localStorage, buscar da API
          const response = await authService.getUserById(parseInt(userId));
          setUserDetails(response);
        } catch (error) {
          console.error('Erro ao buscar detalhes do usuário:', error);
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    fetchUserDetails();
  }, [isAuthenticated, userId]);

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleEdit = () => {
    // Redirecionar para o dashboard com modal de edição aberto
    router.push(`/dashboard?edit=${userId}`);
  };

  const handleDelete = () => {
    if (!userDetails) return;
    
    Modal.confirm({
      title: 'Confirmar Exclusão',
      content: `Tem certeza que deseja excluir o usuário "${userDetails.firstName} ${userDetails.lastName}"? Esta ação não pode ser desfeita.`,
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      async onOk() {
        try {
          // Remover do localStorage
          const storedUsers = localStorage.getItem('users');
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const updatedUsers = users.filter((u: UserDetails) => u.id !== parseInt(userId));
            localStorage.setItem('users', JSON.stringify(updatedUsers));
          }
          
          message.success(`Usuário "${userDetails.firstName} ${userDetails.lastName}" excluído com sucesso!`);
          router.push('/dashboard');
        } catch (error) {
          message.error('Erro ao excluir usuário. Tente novamente.');
          console.error('Erro ao excluir usuário:', error);
        }
      },
    });
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px' }}>
          <LoadingSpinner tip="Carregando..." />
        </Content>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  if (loadingDetails) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px' }}>
          <LoadingSpinner tip="Carregando detalhes do usuário..." />
        </Content>
      </Layout>
    );
  }

  if (!userDetails) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px' }}>
          <Card>
            <Typography.Text>Usuário não encontrado</Typography.Text>
          </Card>
        </Content>
      </Layout>
    );
  }

  const getRoleConfig = (role: string) => {
    const roleConfig = {
      admin: { color: 'gold', icon: <CrownOutlined />, text: 'Admin' },
      user: { color: 'blue', icon: <UserOutlined />, text: 'User' },
      moderator: { color: 'red', icon: <UserOutlined />, text: 'Moderator' }
    };
    return roleConfig[role as keyof typeof roleConfig] || { color: 'default', icon: <UserOutlined />, text: role };
  };

  const roleConfig = getRoleConfig(userDetails.role);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Cabeçalho */}
            <Card 
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <Row align="middle" justify="space-between">
                <Col>
                  <Space size="large">
                    <Button 
                      icon={<ArrowLeftOutlined />}
                      onClick={handleBack}
                      style={{ borderRadius: '8px' }}
                    >
                      Voltar
                    </Button>
                    <Space>
                      <Avatar 
                        size={64} 
                        src={userDetails.image} 
                        icon={<UserOutlined />}
                        style={{ 
                          border: '3px solid #f0f0f0',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                        }}
                      />
                      <div>
                        <Title level={2} style={{ margin: 0 }}>
                          {userDetails.firstName} {userDetails.lastName}
                        </Title>
                        <Space>
                          <Text code>@{userDetails.username}</Text>
                          <Tag 
                            color={roleConfig.color}
                            style={{ 
                              borderRadius: '20px',
                              padding: '4px 12px',
                              fontWeight: 500
                            }}
                          >
                            <Space size={4}>
                              {roleConfig.icon}
                              {roleConfig.text}
                            </Space>
                          </Tag>
                        </Space>
                      </div>
                    </Space>
                  </Space>
                </Col>
                <Col>
                  {user?.role === 'admin' && (
                    <Space>
                      <Button 
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEdit}
                        style={{
                          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        Editar
                      </Button>
                      <Button 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                        style={{ borderRadius: '8px' }}
                      >
                        Excluir
                      </Button>
                    </Space>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Informações Pessoais */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <UserOutlined style={{ color: '#1890ff' }} />
                      <span>Informações Pessoais</span>
                    </Space>
                  }
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Nome Completo">
                      {userDetails.firstName} {userDetails.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Username">
                      <Text code>@{userDetails.username}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Space>
                        <MailOutlined />
                        {userDetails.email}
                      </Space>
                    </Descriptions.Item>
                    {userDetails.phone && (
                      <Descriptions.Item label="Telefone">
                        <Space>
                          <PhoneOutlined />
                          {userDetails.phone}
                        </Space>
                      </Descriptions.Item>
                    )}
                    {userDetails.age && (
                      <Descriptions.Item label="Idade">
                        {userDetails.age} anos
                      </Descriptions.Item>
                    )}
                    {userDetails.birthDate && (
                      <Descriptions.Item label="Data de Nascimento">
                        <Space>
                          <CalendarOutlined />
                          {userDetails.birthDate}
                        </Space>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Gênero">
                      <Badge 
                        status={userDetails.gender === 'female' ? 'processing' : 'success'} 
                        text={userDetails.gender === 'female' ? 'Feminino' : 'Masculino'}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <EnvironmentOutlined style={{ color: '#1890ff' }} />
                      <span>Endereço</span>
                    </Space>
                  }
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                >
                  <Descriptions column={1} size="small">
                    {userDetails.address?.address && (
                      <Descriptions.Item label="Endereço">
                        {userDetails.address.address}
                      </Descriptions.Item>
                    )}
                    {userDetails.address?.city && (
                      <Descriptions.Item label="Cidade">
                        {userDetails.address.city}
                      </Descriptions.Item>
                    )}
                    {userDetails.address?.state && (
                      <Descriptions.Item label="Estado">
                        {userDetails.address.state} {userDetails.address.stateCode && `(${userDetails.address.stateCode})`}
                      </Descriptions.Item>
                    )}
                    {userDetails.address?.postalCode && (
                      <Descriptions.Item label="CEP">
                        {userDetails.address.postalCode}
                      </Descriptions.Item>
                    )}
                    {userDetails.address?.country && (
                      <Descriptions.Item label="País">
                        {userDetails.address.country}
                      </Descriptions.Item>
                    )}
                    {userDetails.address?.coordinates?.lat && userDetails.address?.coordinates?.lng && (
                      <Descriptions.Item label="Coordenadas">
                        {userDetails.address.coordinates.lat}, {userDetails.address.coordinates.lng}
                      </Descriptions.Item>
                    )}
                    {!userDetails.address && (
                      <Descriptions.Item label="Endereço">
                        <Text type="secondary">Informações de endereço não disponíveis</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Informações Físicas e Empresa */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <UserOutlined style={{ color: '#1890ff' }} />
                      <span>Informações Físicas</span>
                    </Space>
                  }
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                >
                  <Descriptions column={1} size="small">
                    {userDetails.height && (
                      <Descriptions.Item label="Altura">
                        {userDetails.height} cm
                      </Descriptions.Item>
                    )}
                    {userDetails.weight && (
                      <Descriptions.Item label="Peso">
                        {userDetails.weight} kg
                      </Descriptions.Item>
                    )}
                    {userDetails.bloodGroup && (
                      <Descriptions.Item label="Tipo Sanguíneo">
                        {userDetails.bloodGroup}
                      </Descriptions.Item>
                    )}
                    {userDetails.eyeColor && (
                      <Descriptions.Item label="Cor dos Olhos">
                        {userDetails.eyeColor}
                      </Descriptions.Item>
                    )}
                    {userDetails.hair?.color && userDetails.hair?.type && (
                      <Descriptions.Item label="Cabelo">
                        {userDetails.hair.color} - {userDetails.hair.type}
                      </Descriptions.Item>
                    )}
                    {!userDetails.height && !userDetails.weight && !userDetails.bloodGroup && !userDetails.eyeColor && !userDetails.hair && (
                      <Descriptions.Item label="Informações Físicas">
                        <Text type="secondary">Informações físicas não disponíveis</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <Space>
                      <TeamOutlined style={{ color: '#1890ff' }} />
                      <span>Empresa</span>
                    </Space>
                  }
                  style={{
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                >
                  <Descriptions column={1} size="small">
                    {userDetails.company?.name && (
                      <Descriptions.Item label="Empresa">
                        {userDetails.company.name}
                      </Descriptions.Item>
                    )}
                    {userDetails.company?.title && (
                      <Descriptions.Item label="Cargo">
                        {userDetails.company.title}
                      </Descriptions.Item>
                    )}
                    {userDetails.company?.department && (
                      <Descriptions.Item label="Departamento">
                        {userDetails.company.department}
                      </Descriptions.Item>
                    )}
                    {userDetails.company?.address?.address && userDetails.company?.address?.city && (
                      <Descriptions.Item label="Endereço da Empresa">
                        {userDetails.company.address.address}, {userDetails.company.address.city}
                      </Descriptions.Item>
                    )}
                    {!userDetails.company && (
                      <Descriptions.Item label="Empresa">
                        <Text type="secondary">Informações da empresa não disponíveis</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Informações Bancárias */}
            <Card 
              title={
                <Space>
                  <BankOutlined style={{ color: '#1890ff' }} />
                  <span>Informações Bancárias</span>
                </Space>
              }
              style={{
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <Descriptions column={2} size="small">
                {userDetails.bank?.cardType && (
                  <Descriptions.Item label="Tipo de Cartão">
                    {userDetails.bank.cardType}
                  </Descriptions.Item>
                )}
                {userDetails.bank?.currency && (
                  <Descriptions.Item label="Moeda">
                    {userDetails.bank.currency}
                  </Descriptions.Item>
                )}
                {userDetails.bank?.cardExpire && (
                  <Descriptions.Item label="Cartão Expira">
                    {userDetails.bank.cardExpire}
                  </Descriptions.Item>
                )}
                {userDetails.bank?.iban && (
                  <Descriptions.Item label="IBAN">
                    {userDetails.bank.iban}
                  </Descriptions.Item>
                )}
                {!userDetails.bank && (
                  <Descriptions.Item label="Informações Bancárias" span={2}>
                    <Text type="secondary">Informações bancárias não disponíveis</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

          </Space>
        </div>
      </Content>
    </Layout>
  );
}
