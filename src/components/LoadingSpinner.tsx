'use client';

import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  tip = 'Carregando...' 
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <Spin 
        size={size} 
        indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
        tip={tip}
      />
    </div>
  );
};

export default LoadingSpinner;
