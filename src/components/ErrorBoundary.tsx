import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onReset?: () => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Something went wrong</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              An error occurred while rendering this component.
            </p>
            {this.state.error && (
              <details className="text-xs text-gray-500 text-left">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <Button onClick={this.handleReset} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary