import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  /** Short name used in the console log and the default fallback. */
  name: string
  children: ReactNode
  fallback?: ReactNode
}

/** Contains a render error to one region so the rest of the app keeps working. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.name}] render failed:`, error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return this.props.fallback ?? (
      <div role="alert" className="container-x py-10">
        <p className="text-muted rounded-card border border-line p-4 text-sm">
          The {this.props.name} section couldn't be displayed.
        </p>
      </div>
    )
  }
}
