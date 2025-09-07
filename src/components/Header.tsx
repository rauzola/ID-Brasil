'use client';

import React, { useCallback } from 'react';
import { Layout, Switch, Typography, Space, Button, Dropdown } from 'antd';
import { SunOutlined, MoonOutlined, UserOutlined, LogoutOutlined, CrownOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

// Configurações de estilo para o header
const HEADER_STYLES = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
} as const;

// Configurações de cores para temas
const THEME_COLORS = {
  light: {
    background: '#fff',
    borderBottom: '#f0f0f0',
    textColor: '#000',
    sunColor: '#faad14',
    moonColor: '#8c8c8c',
  },
  dark: {
    background: '#001529',
    borderBottom: '#303030',
    textColor: '#fff',
    sunColor: '#8c8c8c',
    moonColor: '#1890ff',
  },
} as const;

// Configurações de estilo para botões
const BUTTON_STYLES = {
  userButton: {
    border: 'none',
  },
} as const;

/**
 * Componente Header da aplicação
 * Inclui logo, toggle de tema e menu do usuário
 */
const Header: React.FC = () => {
  const { toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Obtém cores baseadas no tema atual
  const currentThemeColors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  /**
   * Manipula logout do usuário
   */
  const handleUserLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  /**
   * Navega para o dashboard
   */
  const handleNavigateToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  /**
   * Navega para o painel admin
   */
  const handleNavigateToAdmin = useCallback(() => {
    router.push('/admin');
  }, [router]);

  /**
   * Navega para a página de login
   */
  const handleNavigateToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  /**
   * Gera itens do menu do usuário
   */
  const generateUserMenuItems = useCallback(() => {
    const baseItems = [
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
        onClick: handleNavigateToDashboard,
      },
    ];

    // Adiciona item de admin se o usuário for admin
    const adminItems = user?.role === 'admin' ? [{
      key: 'admin',
      icon: <CrownOutlined />,
      label: 'Painel Admin',
      onClick: handleNavigateToAdmin,
    }] : [];

    const logoutItems = [
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sair',
        onClick: handleUserLogout,
      },
    ];

    return [...baseItems, ...adminItems, ...logoutItems];
  }, [user, handleNavigateToDashboard, handleNavigateToAdmin, handleUserLogout]);

  /**
   * Renderiza o toggle de tema
   */
  const renderThemeToggle = useCallback(() => (
    <Space>
      <SunOutlined 
        style={{ 
          color: !isDark ? currentThemeColors.sunColor : currentThemeColors.sunColor
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
          color: isDark ? currentThemeColors.moonColor : currentThemeColors.moonColor
        }} 
      />
    </Space>
  ), [isDark, toggleTheme, currentThemeColors]);

  /**
   * Renderiza o menu do usuário autenticado
   */
  const renderAuthenticatedUserMenu = useCallback(() => (
    <Dropdown
      menu={{ items: generateUserMenuItems() }}
      placement="bottomRight"
      arrow
    >
      <Button 
        type="text" 
        icon={<UserOutlined />}
        style={{ 
          color: currentThemeColors.textColor,
          ...BUTTON_STYLES.userButton,
        }}
      >
        {user?.firstName || user?.username}
      </Button>
    </Dropdown>
  ), [generateUserMenuItems, currentThemeColors.textColor, user]);

  /**
   * Renderiza botão de login para usuário não autenticado
   */
  const renderLoginButton = useCallback(() => (
    <Button 
      type="primary" 
      onClick={handleNavigateToLogin}
    >
      Entrar
    </Button>
  ), [handleNavigateToLogin]);

  return (
    <AntHeader 
      style={{ 
        ...HEADER_STYLES,
        background: currentThemeColors.background,
        borderBottom: `1px solid ${currentThemeColors.borderBottom}`,
      }}
    >
      <Title 
        level={3} 
        style={{ 
          margin: 0, 
          color: currentThemeColors.textColor 
        }}
      >
        ID Brasil
      </Title>
      
      <Space>
        {renderThemeToggle()}
        {isAuthenticated ? renderAuthenticatedUserMenu() : renderLoginButton()}
      </Space>
    </AntHeader>
  );
};

export default Header;