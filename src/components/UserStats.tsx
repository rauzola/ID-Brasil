import React from 'react';
import { Row, Col, Card, Statistic, Space } from 'antd';
import { TeamOutlined, CrownOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';

interface UserStatsProps {
  stats: {
    total: number;
    admins: number;
    users: number;
    moderators: number;
  };
}

export default function UserStats({ stats }: UserStatsProps) {
  return (
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
  );
}
