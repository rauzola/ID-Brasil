'use client';

import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

// Props do componente LoadingSpinner
interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
}

// Configurações de estilo para o container do spinner
const CONTAINER_STYLES = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
  flexDirection: 'column' as const,
  gap: '16px',
} as const;

// Configurações do ícone de loading
const LOADING_ICON_STYLES = {
  fontSize: 24,
} as const;

/**
 * Componente LoadingSpinner
 * Exibe um spinner de carregamento com mensagem personalizável
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  tip = 'Carregando...' 
}) => {
  return (
    <div style={CONTAINER_STYLES}>
      <Spin 
        size={size} 
        spinning={true}
        tip={tip}
        indicator={<LoadingOutlined style={LOADING_ICON_STYLES} spin />}
      />
    </div>
  );
};

export default LoadingSpinner;