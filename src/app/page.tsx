'use client';

import React from 'react';
import { Layout, Card, Typography, Space, Button } from 'antd';
import { CheckCircleOutlined, RocketOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import ApiTest from '@/components/ApiTest';
import { useAuth } from '@/contexts/AuthContext';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px' }}>
          <LoadingSpinner tip="Validando autenticação..." />
        </Content>
      </Layout>
    );
  }

  // Redirecionar usuários autenticados para o dashboard
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={1}>
                  <RocketOutlined style={{ marginRight: '16px' }} />
                  ID Brasil - Desafio Técnico
                </Title>
                <Paragraph style={{ fontSize: '18px' }}>
                  Bem-vindo ao projeto de demonstração das tecnologias utilizadas na ID Brasil
                </Paragraph>
                {isAuthenticated && (
                  <div style={{ 
                    background: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: '6px', 
                    padding: '16px',
                    margin: '16px 0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <UserOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                      <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                        Usuário logado: {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                    <div style={{ color: '#52c41a', fontSize: '14px' }}>
                      <div>Username: {user?.username}</div>
                      <div>Email: {user?.email}</div>
                      <div>ID: {user?.id}</div>
                    </div>
                  </div>
                )}
              </div>

              <Card title="Tecnologias Implementadas" style={{ marginTop: '24px' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>React 19 com TypeScript</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Next.js 15 com App Router</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>React Query (TanStack Query)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Axios para requisições HTTP</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Ant Design com tema personalizado</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Sistema de temas (Light/Dark)</span>
                  </div>
                </Space>
              </Card>

              <Card title="Funcionalidades" style={{ marginTop: '24px' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Alternância de tema global (Light/Dark)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Persistência do tema no localStorage</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Configuração do React Query</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Interceptors do Axios configurados</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Sistema de autenticação com Context API</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Tela de login com validação de formulário</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Integração com API DummyJSON para autenticação</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <span>Validação automática de token JWT</span>
                  </div>
                </Space>
              </Card>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button type="primary" size="large" icon={<RocketOutlined />}>
                  Pronto para Desenvolvimento
                </Button>
              </div>
            </Space>
          </Card>
          
          <ApiTest />
        </div>
      </Content>
    </Layout>
  );
}
