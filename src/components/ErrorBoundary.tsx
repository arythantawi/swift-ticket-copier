import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-6 shadow-lg">
            <h1 className="font-display text-2xl font-bold mb-2">
              Halaman gagal dimuat
            </h1>
            <p className="text-muted-foreground mb-4">
              Ada error JavaScript yang membuat website tampil blank.
            </p>

            {this.state.error?.message && (
              <pre className="text-xs bg-muted/40 border border-border rounded-xl p-4 overflow-auto mb-4">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                Coba lanjut
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Jika masih terjadi, buka DevTools Console untuk melihat detail error.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
