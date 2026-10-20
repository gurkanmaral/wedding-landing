import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f3ee] p-6 text-center text-[#1d1b18]">
        <div className="max-w-sm">
          <h1 className="font-display text-4xl">This invitation couldn’t load</h1>
          <p className="mt-3 text-sm leading-6 text-[#5b554c]">Refresh the page to try again, or go back to the collection.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-full bg-[#1d1b18] px-5 text-sm text-white"
            >
              Refresh
            </button>
            <a href="/" className="inline-flex min-h-11 items-center rounded-full border border-[#1d1b18] px-5 text-sm">
              All invitations
            </a>
          </div>
        </div>
      </main>
    )
  }
}
