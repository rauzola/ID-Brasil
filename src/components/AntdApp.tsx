'use client';

import React from 'react';
import { App as AntdApp } from 'antd';

interface AntdAppProviderProps {
  children: React.ReactNode;
}

const AntdAppProvider: React.FC<AntdAppProviderProps> = ({ children }) => {
  return (
    <AntdApp>
      {children}
    </AntdApp>
  );
};

export default AntdAppProvider;
