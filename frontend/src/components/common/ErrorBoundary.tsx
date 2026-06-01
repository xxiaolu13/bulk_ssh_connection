import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result, Modal } from '@arco-design/web-react';
import { IconRefresh, IconBug } from '@arco-design/web-react/icon';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * 错误边界组件
 * 捕获组件树中的 JavaScript 错误，记录错误并显示降级 UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 调用自定义错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 可以在这里将错误上报到服务器
    // this.logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  showErrorDetails = (): void => {
    const { error, errorInfo } = this.state;
    if (!error || !errorInfo) return;

    const details = `
错误信息:
${error.toString()}

错误堆栈:
${error.stack}

组件堆栈:
${errorInfo.componentStack}
    `.trim();

    Modal.error({
      title: '错误详情',
      content: (
        <pre
          style={{
            background: 'var(--color-fill-3)',
            padding: '12px',
            borderRadius: '4px',
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          {details}
        </pre>
      ),
      okText: '关闭',
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义降级 UI，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的错误 UI
      return (
        <div className="error-boundary-container">
          <Result
            status="error"
            icon={<IconBug style={{ fontSize: 80, color: 'var(--color-fill-4)' }} />}
            title="页面出错了"
            subTitle="抱歉，应用程序遇到了意外错误"
            extra={
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button type="primary" icon={<IconRefresh />} onClick={this.handleReload}>
                  重新加载页面
                </Button>
                <Button onClick={this.handleReset}>重试</Button>
                <Button onClick={this.showErrorDetails}>查看详情</Button>
              </div>
            }
            style={{
              paddingTop: '80px',
              paddingBottom: '40px',
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 用于捕获异步错误的 Hook
 */
export function useErrorHandler(
  onError?: (error: Error) => void
): (error: Error) => void {
  const handleError = React.useCallback(
    (error: Error) => {
      console.error('Async error caught:', error);
      if (onError) {
        onError(error);
      }
    },
    [onError]
  );

  return handleError;
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
