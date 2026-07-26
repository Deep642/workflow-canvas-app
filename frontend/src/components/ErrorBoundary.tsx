import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '12px',
            background: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: '4px',
            color: '#c62828',
            fontSize: '12px',
          }}
        >
          <strong>⚠️ Component Error</strong>
          <p>{this.state.error?.message || 'An error occurred'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
