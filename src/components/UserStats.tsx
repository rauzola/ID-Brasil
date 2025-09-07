import React, { useCallback } from 'react';
import { Row, Col, Card, Statistic, Space } from 'antd';
import { TeamOutlined, CrownOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';

// Interface para estatísticas de usuários
interface UserStatistics {
  total: number;
  admins: number;
  users: number;
  moderators: number;
}

// Props do componente UserStats
interface UserStatsProps {
  stats: UserStatistics;
}

// Configurações de gradientes para os cards
const GRADIENT_CONFIGS = {
  total: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
    icon: <TeamOutlined style={{ color: '#fff' }} />,
    title: 'Total de Usuários',
  },
  admins: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
    icon: <CrownOutlined style={{ color: '#fff' }} />,
    title: 'Administradores',
  },
  users: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
    icon: <UserOutlined style={{ color: '#fff' }} />,
    title: 'Usuários',
  },
  moderators: {
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    boxShadow: '0 8px 32px rgba(67, 233, 123, 0.3)',
    icon: <EyeOutlined style={{ color: '#fff' }} />,
    title: 'Moderadores',
  },
} as const;

// Configurações de estilo para os cards
const CARD_STYLES = {
  border: 'none',
  borderRadius: '16px',
  body: { padding: '24px' },
} as const;

// Configurações de estilo para as estatísticas
const STATISTIC_STYLES = {
  title: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: 500,
  },
  value: {
    color: '#fff',
    fontSize: '32px',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
} as const;

/**
 * Componente para exibir estatísticas de usuários
 * Mostra cards com gradientes para diferentes tipos de usuários
 */
export default function UserStats({ stats }: UserStatsProps) {
  /**
   * Renderiza um card de estatística individual
   */
  const renderStatisticCard = useCallback((
    key: keyof UserStatistics,
    value: number,
    config: typeof GRADIENT_CONFIGS[keyof typeof GRADIENT_CONFIGS]
  ) => (
    <Col xs={24} sm={12} lg={6} key={key}>
      <Card 
        className="gradient-card"
        style={{ 
          background: config.background,
          ...CARD_STYLES,
          boxShadow: config.boxShadow,
        }}
        styles={{ body: CARD_STYLES.body }}
      >
        <Statistic
          title={
            <Space>
              {config.icon}
              <span style={STATISTIC_STYLES.title}>
                {config.title}
              </span>
            </Space>
          }
          value={value}
          valueStyle={STATISTIC_STYLES.value}
        />
      </Card>
    </Col>
  ), []);

  /**
   * Renderiza todos os cards de estatísticas
   */
  const renderAllStatisticCards = useCallback(() => {
    const statisticEntries = Object.entries(stats) as Array<[keyof UserStatistics, number]>;
    
    return statisticEntries.map(([key, value]) => {
      const config = GRADIENT_CONFIGS[key];
      return renderStatisticCard(key, value, config);
    });
  }, [stats, renderStatisticCard]);

  return (
    <Row gutter={[24, 24]}>
      {renderAllStatisticCards()}
    </Row>
  );
}