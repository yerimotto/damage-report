import { Component, type ReactNode } from 'react'
import { navigate } from '../lib/router'

/** Catches a crashed screen and offers a way back instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="serif-display text-[48px]">Something slipped</p>
        <p className="max-w-[300px] text-[14px] text-ink-2">{this.state.error.message}</p>
        <button type="button" className="btn btn-primary mt-2" onClick={() => navigate({ name: 'fits' })}>
          Back to fits
        </button>
      </main>
    )
  }
}
