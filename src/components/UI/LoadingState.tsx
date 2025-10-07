import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'default' | 'large';
  spinning?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement en cours...',
  size = 'default',
  spinning = true,
  children,
  className = ''
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24 }} spin />;

  if (children) {
    return (
      <Spin spinning={spinning} indicator={antIcon} tip={message}>
        {children}
      </Spin>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Spin indicator={antIcon} size={size} />
      <Text className="mt-4 text-gray-600">{message}</Text>
    </div>
  );
};

export default LoadingState;
