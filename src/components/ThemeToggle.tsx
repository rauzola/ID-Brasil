import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';

// Configurações de cores para os temas
const THEME_COLORS = {
  light: {
    iconColor: '#1890ff',
    backgroundColor: '#fafafa',
    borderColor: '#d9d9d9',
  },
  dark: {
    iconColor: '#faad14',
    backgroundColor: '#141414',
    borderColor: '#434343',
  },
} as const;

// Configurações de estilo para o botão
const BUTTON_STYLES = {
  fontSize: '18px',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
} as const;

/**
 * Componente ThemeToggle
 * Botão para alternar entre tema claro e escuro
 */
export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  // Obtém cores baseadas no tema atual
  const currentThemeColors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  /**
   * Gera o texto do tooltip baseado no tema atual
   */
  const getTooltipText = () => {
    return isDark ? 'Ativar modo claro' : 'Ativar modo escuro';
  };

  /**
   * Gera o ícone baseado no tema atual
   */
  const getThemeIcon = () => {
    return isDark ? <SunOutlined /> : <MoonOutlined />;
  };

  return (
    <Tooltip title={getTooltipText()}>
      <Button
        type="text"
        icon={getThemeIcon()}
        onClick={toggleTheme}
        style={{
          ...BUTTON_STYLES,
          color: currentThemeColors.iconColor,
          border: `1px solid ${currentThemeColors.borderColor}`,
          backgroundColor: currentThemeColors.backgroundColor,
        }}
        className="theme-toggle-button"
      />
    </Tooltip>
  );
}