'use client';

import React, { useState, useCallback } from 'react';
import { Layout, Form, Input, Button, Card, Typography, Space, App } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const { Title, Text } = Typography;
const { Content } = Layout;

// Interface para dados do formulário de login
interface LoginFormData {
  username: string;
  password: string;
}

// Configurações de estilo para a página
const PAGE_STYLES = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg-primary)',
  padding: '20px',
} as const;

// Configurações de estilo para o card de login
const CARD_STYLES = {
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 8px 32px var(--shadow-primary)',
  borderRadius: '12px',
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
} as const;

// Configurações de estilo para o ícone de login
const LOGIN_ICON_STYLES = {
  fontSize: '48px',
  color: 'var(--button-primary)',
  marginBottom: '16px',
} as const;

// Configurações de estilo para o título
const TITLE_STYLES = {
  margin: 0,
  color: 'var(--text-primary)',
} as const;

// Configurações de estilo para o container do ícone e título
const HEADER_CONTAINER_STYLES = {
  textAlign: 'center' as const,
} as const;

// Configurações de estilo para as credenciais de teste
const CREDENTIALS_STYLES = {
  textAlign: 'center' as const,
} as const;

// Configurações de estilo para o texto das credenciais
const CREDENTIALS_TEXT_STYLES = {
  fontSize: '12px',
  color: 'var(--text-primary)',
} as const;

// Credenciais de teste para demonstração
const TEST_CREDENTIALS = [
  { username: 'henryh', password: 'henryhpass', role: 'user' },
  { username: 'emilys', password: 'emilyspass', role: 'admin' },
  { username: 'oliviaw', password: 'oliviawpass', role: 'moderator' },
] as const;

// Roles permitidos no sistema
const ALLOWED_ROLES = ['admin', 'user', 'moderator'] as const;

/**
 * Página de login da aplicação
 * Permite autenticação de usuários com validação de credenciais
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { message } = App.useApp();

  /**
   * Trata erros de login de forma específica
   */
  const handleLoginError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : '';
    const errorName = error instanceof Error ? error.name : '';
    
    // Tratar erro específico de usuário não cadastrado
    if (errorMessage === 'Usuário não cadastrado no sistema' || errorName === 'RoleValidationError') {
      message.error('Usuário não cadastrado no sistema');
      return;
    }
    
    const axiosError = error as { response?: { status?: number }; code?: string };
    
    // Tratar diferentes tipos de erro
    if (axiosError.response?.status === 400) {
      message.error('Credenciais inválidas. Verifique o usuário e senha.');
    } else if (axiosError.response?.status === 401) {
      message.error('Usuário ou senha incorretos.');
    } else if (axiosError.response?.status === 429) {
      message.error('Muitas tentativas. Tente novamente em alguns minutos.');
    } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
      message.error('Erro de conexão. Verifique sua internet.');
    } else {
      message.error('Erro ao realizar login. Tente novamente.');
    }
  }, [message]);

  /**
   * Processa o envio do formulário de login
   */
  const handleFormSubmit = useCallback(async (values: LoginFormData) => {
    setIsLoading(true);
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        message.success('Login realizado com sucesso!');
        router.push('/dashboard');
      } else {
        message.error('Nome de usuário ou senha incorretos');
      }
    } catch (error: unknown) {
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  }, [login, router, message, handleLoginError]);

  /**
   * Renderiza o cabeçalho da página de login
   */
  const renderLoginHeader = useCallback(() => (
    <div style={HEADER_CONTAINER_STYLES}>
      <LoginOutlined style={LOGIN_ICON_STYLES} />
      <Title level={2} style={TITLE_STYLES}>
        ID Brasil
      </Title>
      <Text type="secondary">
        Faça login para acessar o sistema
      </Text>
    </div>
  ), []);

  /**
   * Renderiza as credenciais de teste
   */
  const renderTestCredentials = useCallback(() => (
    <div style={CREDENTIALS_STYLES} className="login-credentials">
      <Text type="secondary" style={CREDENTIALS_TEXT_STYLES}>
        <div>Credenciais de teste (roles permitidos: {ALLOWED_ROLES.join(', ')}):</div>
        {TEST_CREDENTIALS.map((credential, index) => (
          <div key={index}>
            <strong>{credential.username}</strong> / <strong>{credential.password}</strong> 
            <span style={{ 
              color: credential.role === 'admin' ? 'var(--warning-color)' : 
                     credential.role === 'moderator' ? 'var(--info-color)' : 'var(--success-color)', 
              marginLeft: '8px' 
            }}>
              ({credential.role})
            </span>
          </div>
        ))}
        <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--error-color)' }}>
          ⚠️ Apenas usuários com role &quot;admin&quot;, &quot;user&quot; ou &quot;moderator&quot; podem fazer login
        </div>
      </Text>
    </div>
  ), []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content 
        style={PAGE_STYLES}
        className="login-page-content"
      >
        <Card style={CARD_STYLES}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {renderLoginHeader()}

            <Form
              name="login"
              onFinish={handleFormSubmit}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Nome de Usuário"
                name="username"
                rules={[
                  { required: true, message: 'Por favor, insira seu nome de usuário!' },
                  { min: 3, message: 'Nome de usuário deve ter pelo menos 3 caracteres!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Digite seu nome de usuário"
                  autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                label="Senha"
                name="password"
                rules={[
                  { required: true, message: 'Por favor, insira sua senha!' },
                  { min: 6, message: 'Senha deve ter pelo menos 6 caracteres!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  block
                  size="large"
                  icon={<LoginOutlined />}
                >
                  Entrar
                </Button>
              </Form.Item>
            </Form>

            {renderTestCredentials()}
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}