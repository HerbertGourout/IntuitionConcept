import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Card, Space } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { auditLogger } from '../../services/auditLogger';

const { Text, Paragraph } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to audit service
    auditLogger.logEvent({
      userId: 'system',
      userRole: 'admin',
      action: 'error_boundary_catch',
      resource: 'ui_component',
      details: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      },
      result: 'failure',
      severity: 'high'
    }).catch(console.error);

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <Result
              status="error"
              icon={<ExclamationCircleOutlined className="text-red-500" />}
              title="Une erreur inattendue s'est produite"
              subTitle="L'application a rencontré un problème technique. Nos équipes ont été automatiquement notifiées."
              extra={
                <Space direction="vertical" className="w-full">
                  <Space wrap>
                    <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleRetry}>
                      Réessayer
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={this.handleReload}>
                      Recharger la page
                    </Button>
                    <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
                      Retour à l'accueil
                    </Button>
                  </Space>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <Card size="small" className="mt-4 text-left">
                      <Typography>
                        <Text strong>Détails de l'erreur (développement uniquement):</Text>
                        <Paragraph className="mt-2">
                          <Text code className="text-red-600">
                            {this.state.error.message}
                          </Text>
                        </Paragraph>
                        {this.state.error.stack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-gray-600">
                              Stack trace
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                              {this.state.error.stack}
                            </pre>
                          </details>
                        )}
                        {this.state.errorInfo?.componentStack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-gray-600">
                              Component stack
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}
                      </Typography>
                    </Card>
                  )}
                </Space>
              }
            />
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
