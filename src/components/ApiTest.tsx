'use client';

import React, { useState } from 'react';
import { Button, Card, Typography, Space, App } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { authService } from '@/services/api';

const { Title, Text } = Typography;

const ApiTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const { message } = App.useApp();

  const testApiConnection = async () => {
    setTesting(true);
    try {
      // Testar com credenciais válidas
      const result = await authService.login('emilys', 'emilyspass');
      message.success('API funcionando corretamente!');
      console.log('Resultado do teste:', result);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      console.error('Erro no teste da API:', error);
      message.error(`Erro na API: ${axiosError.response?.data?.message || axiosError.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card style={{ marginTop: '24px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>
            <ApiOutlined style={{ marginRight: '8px' }} />
            Teste de Conexão com API
          </Title>
          <Text type="secondary">
            Clique no botão abaixo para testar a conexão com a API DummyJSON
          </Text>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            loading={testing}
            onClick={testApiConnection}
            icon={<ApiOutlined />}
          >
            Testar API
          </Button>
        </div>
      </Space>
    </Card>
  );
};

export default ApiTest;
