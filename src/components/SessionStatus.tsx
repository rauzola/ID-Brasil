'use client';

import React from 'react';
import { Alert, Progress, Button } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const SessionStatus: React.FC = () => {
  const { sessionExpiresAt, isSessionExpiring, isRefreshing, tryRefreshNow } = useAuth();

  if (!sessionExpiresAt) return null;

  const now = Date.now();
  const timeUntilExpiry = sessionExpiresAt - now;
  const totalSessionTime = 10 * 60 * 1000; // 10 minutos em millisegundos
  const remainingTime = Math.max(0, timeUntilExpiry);
  const progressPercent = Math.max(0, (remainingTime / totalSessionTime) * 100);
  const remainingSeconds = Math.ceil(remainingTime / 1000);

  if (remainingTime <= 0) {
    return (
      <Alert
        message="Sessão Expirada"
        description="Sua sessão expirou. Você será redirecionado para o login."
        type="error"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ marginBottom: '16px' }}
      />
    );
  }

  if (isRefreshing) {
    return (
      <Alert
        message="Renovando Sessão"
        description="Sua sessão está sendo renovada automaticamente..."
        type="info"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ marginBottom: '16px' }}
      />
    );
  }

  if (isSessionExpiring) {
    return (
      <Alert
        message="Sessão Expirando"
        description={`Sua sessão expira em ${remainingSeconds} segundos. Renovação automática em andamento...`}
        type="warning"
        showIcon
        icon={<ClockCircleOutlined />}
        style={{ marginBottom: '16px' }}
        action={
          <div style={{ marginTop: '8px' }}>
            <Progress
              percent={progressPercent}
              size="small"
              status={remainingSeconds < 10 ? 'exception' : 'active'}
              showInfo={false}
            />
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={tryRefreshNow}
              loading={isRefreshing}
              style={{ marginTop: '8px' }}
            >
              Renovar Agora
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <Alert
      message="Sessão Ativa"
      description={`Sua sessão é válida por mais ${remainingSeconds} segundos`}
      type="success"
      showIcon
      icon={<CheckCircleOutlined />}
      style={{ marginBottom: '16px' }}
      action={
        <div style={{ marginTop: '8px' }}>
          <Progress
            percent={progressPercent}
            size="small"
            status="success"
            showInfo={false}
          />
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={tryRefreshNow}
            loading={isRefreshing}
            style={{ marginTop: '8px' }}
          >
            Renovar Agora
          </Button>
        </div>
      }
    />
  );
};

export default SessionStatus;
