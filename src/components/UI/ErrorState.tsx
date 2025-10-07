import React from 'react';
import { Result, Button, Card, Typography } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Une erreur est survenue',
  description = 'Nous rencontrons des difficultés techniques. Veuillez réessayer.',
  error,
  onRetry,
  onGoHome,
  showDetails = false,
  className = ''
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Card className="max-w-2xl w-full">
        <Result
          status="error"
          icon={<ExclamationCircleOutlined className="text-red-500" />}
          title={title}
          subTitle={description}
          extra={[
            onRetry && (
              <Button key="retry" type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
                Réessayer
              </Button>
            ),
            onGoHome && (
              <Button key="home" icon={<HomeOutlined />} onClick={onGoHome}>
                Retour à l'accueil
              </Button>
            )
          ].filter(Boolean)}
        />
        
        {showDetails && errorMessage && (
          <Card size="small" className="mt-4 bg-red-50 border-red-200">
            <Paragraph className="text-red-700 mb-0">
              <strong>Détails de l'erreur :</strong><br />
              <code className="text-sm">{errorMessage}</code>
            </Paragraph>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default ErrorState;
