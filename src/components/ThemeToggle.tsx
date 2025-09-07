import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <Tooltip title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}>
      <Button
        type="text"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{
          color: isDark ? '#faad14' : '#1890ff',
          fontSize: '18px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: isDark ? '1px solid #434343' : '1px solid #d9d9d9',
          backgroundColor: isDark ? '#141414' : '#fafafa',
          transition: 'all 0.3s ease',
        }}
        className="theme-toggle-button"
      />
    </Tooltip>
  );
}
