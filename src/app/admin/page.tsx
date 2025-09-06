'use client';

import React, { useEffect } from 'react';
import { Layout, Card, Typography, Space, Row, Col, Statistic, Button, Alert } from 'antd';
import { 
  CrownOutlined, 
  UserOutlined, 
  SettingOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  HomeOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function AdminPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Redirecionar se não for admin
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px' }}>
          <LoadingSpinner />
        </Content>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role !== 'admin') {
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
            {/* Header do Admin */}
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space>
                    <CrownOutlined style={{ fontSize: '48px', color: '#faad14' }} />
                    <div>
                      <Title level={2} style={{ margin: 0, color: '#faad14' }}>
                        Painel Administrativo
                      </Title>
                      <Text type="secondary">
                        Área restrita para administradores - ID Brasil
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
                      icon={<DashboardOutlined />}
                      onClick={() => router.push('/dashboard')}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      icon={<LogoutOutlined />}
                      danger
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Aviso de Segurança */}
            <Alert
              message="Acesso Administrativo"
              description="Você está acessando uma área restrita do sistema. Todas as suas ações são registradas e monitoradas."
              type="warning"
              showIcon
              icon={<SecurityScanOutlined />}
              style={{ marginBottom: '16px' }}
            />

            {/* Estatísticas Administrativas */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Usuários Ativos"
                    value={150}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Administradores"
                    value={5}
                    prefix={<CrownOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Sessões Ativas"
                    value={23}
                    prefix={<DatabaseOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Sistema Status"
                    value="Online"
                    prefix={<SettingOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Funcionalidades Administrativas */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Gerenciamento de Usuários" extra={<UserOutlined />}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Usuário Atual:</Text>
                      <br />
                      <Text>{user?.firstName} {user?.lastName}</Text>
                    </div>
                    <div>
                      <Text strong>Nível de Acesso:</Text>
                      <br />
                      <Text code style={{ color: '#faad14' }}>Administrador</Text>
                    </div>
                    <div>
                      <Text strong>Permissões:</Text>
                      <br />
                      <Text>• Gerenciar usuários</Text>
                      <br />
                      <Text>• Acessar logs do sistema</Text>
                      <br />
                      <Text>• Configurações avançadas</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Configurações do Sistema" extra={<SettingOutlined />}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Versão do Sistema:</Text>
                      <br />
                      <Text code>v1.0.0</Text>
                    </div>
                    <div>
                      <Text strong>Última Atualização:</Text>
                      <br />
                      <Text>{new Date().toLocaleDateString('pt-BR')}</Text>
                    </div>
                    <div>
                      <Text strong>Status da API:</Text>
                      <br />
                      <Text style={{ color: '#52c41a' }}>● Conectada</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Ações Administrativas */}
            <Card title="Ações Administrativas" extra={<CrownOutlined />}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Button 
                    type="primary" 
                    icon={<UserOutlined />}
                    block
                    size="large"
                  >
                    Gerenciar Usuários
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button 
                    icon={<DatabaseOutlined />}
                    block
                    size="large"
                  >
                    Ver Logs
                  </Button>
                </Col>
                <Col xs={24} sm={8}>
                  <Button 
                    icon={<SettingOutlined />}
                    block
                    size="large"
                  >
                    Configurações
                  </Button>
                </Col>
              </Row>
            </Card>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}
