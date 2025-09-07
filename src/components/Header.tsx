'use client';

import React from 'react';
import { Layout, Switch, Typography, Space, Button, Dropdown } from 'antd';
import { SunOutlined, MoonOutlined, UserOutlined, LogoutOutlined, CrownOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `Olá, ${user?.firstName || user?.username}`,
      disabled: true,
    },
    {
      key: 'email',
      label: user?.email,
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'dashboard',
      icon: <UserOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard'),
    },
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <CrownOutlined />,
      label: 'Painel Admin',
      onClick: () => router.push('/admin'),
    }] : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: isDark ? '#001529' : '#fff',
        borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`
      }}
    >
      <Title 
        level={3} 
        style={{ 
          margin: 0, 
          color: isDark ? '#fff' : '#000' 
        }}
      >
        ID Brasil
      </Title>
      
      <Space>
        <SunOutlined 
          style={{ 
            color: !isDark ? '#faad14' : '#8c8c8c' 
          }} 
        />
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
        />
        <MoonOutlined 
          style={{ 
            color: isDark ? '#1890ff' : '#8c8c8c' 
          }} 
        />
        
        {isAuthenticated ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Button 
              type="text" 
              icon={<UserOutlined />}
              style={{ 
                color: isDark ? '#fff' : '#000',
                border: 'none'
              }}
            >
              {user?.firstName || user?.username}
            </Button>
          </Dropdown>
        ) : (
          <Button 
            type="primary" 
            onClick={() => router.push('/login')}
          >
            Entrar
          </Button>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header;
