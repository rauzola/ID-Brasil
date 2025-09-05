'use client';

import React from 'react';
import { Layout, Card, Typography, Space, Row, Col, Statistic, Avatar, Button } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  IdcardOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

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
    router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header do Dashboard */}
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <Avatar 
                      size={64} 
                      src={user?.image} 
                      icon={<UserOutlined />}
                    />
                    <div>
                      <Title level={2} style={{ margin: 0 }}>
                        Bem-vindo, {user?.firstName}!
                      </Title>
                      <Text type="secondary">
                        Dashboard - ID Brasil
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Button 
                      icon={<HomeOutlined />}
                      onClick={() => router.push('/')}
                    >
                      Página Inicial
                    </Button>
                    <Button 
                      type="primary" 
                      danger
                      icon={<LogoutOutlined />}
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Estatísticas do Usuário */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="ID do Usuário"
                    value={user?.id}
                    prefix={<IdcardOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Username"
                    value={user?.username}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Gênero"
                    value={user?.gender === 'female' ? 'Feminino' : 'Masculino'}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Status"
                    value="Ativo"
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Informações Detalhadas */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Informações Pessoais" extra={<UserOutlined />}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Nome Completo:</Text>
                      <br />
                      <Text>{user?.firstName} {user?.lastName}</Text>
                    </div>
                    <div>
                      <Text strong>Username:</Text>
                      <br />
                      <Text code>{user?.username}</Text>
                    </div>
                    <div>
                      <Text strong>Gênero:</Text>
                      <br />
                      <Text>{user?.gender === 'female' ? 'Feminino' : 'Masculino'}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Informações de Contato" extra={<MailOutlined />}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Email:</Text>
                      <br />
                      <Text>{user?.email}</Text>
                    </div>
                    <div>
                      <Text strong>ID do Usuário:</Text>
                      <br />
                      <Text code>{user?.id}</Text>
                    </div>
                    <div>
                      <Text strong>Avatar:</Text>
                      <br />
                      <Avatar 
                        size={40} 
                        src={user?.image} 
                        icon={<UserOutlined />}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Token Information */}
            <Card title="Informações de Sessão" extra={<IdcardOutlined />}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong>Access Token:</Text>
                    <br />
                    <Text code style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                      {user?.token?.substring(0, 50)}...
                    </Text>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong>Refresh Token:</Text>
                    <br />
                    <Text code style={{ fontSize: '10px', wordBreak: 'break-all' }}>
                      {user?.refreshToken?.substring(0, 50)}...
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}
