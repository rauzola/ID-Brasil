'use client';

import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, Alert, Statistic, Row, Col } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Paragraph, Text } = Typography;

const SessionInfo: React.FC = () => {
  const { sessionExpiresAt, isRefreshing, refreshToken } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Atualizar contador de tempo restante
  useEffect(() => {
    if (!sessionExpiresAt) return;

    const updateTimeLeft = () => {
      const now = Date.now();
      const timeRemaining = sessionExpiresAt - now;
      
      if (timeRemaining <= 0) {
        setTimeLeft('Sessão expirada');
        return;
      }

      const minutes = Math.floor(timeRemaining / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  const handleRefreshToken = async () => {
    setIsManualRefreshing(true);
    try {
      const success = await refreshToken();
      if (!success) {
        // Falha ao renovar, o usuário será redirecionado automaticamente
        console.log('Falha ao renovar token');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  if (!sessionExpiresAt) {
    return null;
  }

  const isSessionExpiringSoon = sessionExpiresAt && (sessionExpiresAt - Date.now()) < 2 * 60 * 1000; // 2 minutos

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Alerta de sessão expirando */}
      {isSessionExpiringSoon && (
        <Alert
          message="Sessão Próxima do Vencimento"
          description={`Sua sessão expira em ${timeLeft}. Clique em "Renovar Sessão" para continuar.`}
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          action={
            <Button 
              size="small" 
              type="primary" 
              loading={isManualRefreshing}
              onClick={handleRefreshToken}
              icon={<ReloadOutlined />}
            >
              Renovar Sessão
            </Button>
          }
        />
      )}

      {/* Estatísticas da Sessão */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Status da Sessão"
              value="Ativa"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tempo Restante"
              value={timeLeft}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ 
                color: isSessionExpiringSoon ? '#faad14' : '#1890ff' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Refresh Automático"
              value={isRefreshing ? "Renovando..." : "Ativo"}
              prefix={<ReloadOutlined />}
              valueStyle={{ 
                color: isRefreshing ? '#1890ff' : '#52c41a' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Informações sobre a Sessão */}
      <Card title="Sobre a Sessão">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph>
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
            Sua sessão é válida por <strong>10 minutos</strong> após o login.
          </Paragraph>
          <Paragraph>
            <ClockCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
            Você pode renovar sua sessão a qualquer momento sem precisar fazer login novamente.
          </Paragraph>
          <Paragraph>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
            Quando a sessão estiver próxima do vencimento, você verá um aviso para renová-la.
          </Paragraph>
          <Paragraph>
            <ReloadOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
            <strong>Refresh Automático:</strong> O sistema tenta renovar sua sessão automaticamente quando restam menos de 2 minutos.
            {isRefreshing && (
              <span style={{ color: '#1890ff', marginLeft: '8px' }}>
                (Renovando automaticamente...)
              </span>
            )}
          </Paragraph>
        </Space>
      </Card>

      {/* Ações */}
      <Card title="Ações">
        <Space wrap>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            loading={isManualRefreshing}
            onClick={handleRefreshToken}
          >
            Renovar Sessão
          </Button>
          <Button 
            icon={<ClockCircleOutlined />}
            onClick={() => window.location.reload()}
          >
            Atualizar Dados
          </Button>
        </Space>
      </Card>
    </Space>
  );
};

export default SessionInfo;
