'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, App } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { message } = App.useApp();

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    
    try {
      console.log('Tentando fazer login com:', values.username);
      const success = await login(values.username, values.password);
      console.log('Resultado do login:', success);
      
      if (success) {
        message.success('Login realizado com sucesso!');
        router.push('/dashboard');
      } else {
        console.log('Login falhou - success = false');
        message.error('Nome de usuário ou senha incorretos');
      }
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <LoginOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              ID Brasil
            </Title>
            <Text type="secondary">
              Faça login para acessar o sistema
            </Text>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
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
                loading={loading}
                block
                size="large"
                icon={<LoginOutlined />}
              >
                Entrar
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <div>Credenciais de teste:</div>
              <div><strong>emilys</strong> / <strong>emilyspass</strong></div>
              <div><strong>kminchelle</strong> / <strong>0lelplR</strong></div>
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
