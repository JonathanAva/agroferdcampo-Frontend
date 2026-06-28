import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("ErrorBoundary capturó un error:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/home";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
          style={{ backgroundColor: "var(--bg, #f9fafb)" }}
        >
          <div
            className="w-full max-w-md p-8 rounded-2xl border text-center"
            style={{
              backgroundColor: "var(--card, #ffffff)",
              borderColor: "var(--border, #e5e7eb)",
            }}
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h1
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-main, #111827)" }}
            >
              Algo salió mal
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-sec, #6b7280)" }}
            >
              Ocurrió un error inesperado en la aplicación. Por favor recarga la página.
            </p>
            {this.state.error && (
              <pre
                className="text-left text-xs p-3 rounded-lg mb-6 overflow-auto max-h-32"
                style={{
                  backgroundColor: "var(--bg, #f9fafb)",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent, #059669)" }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
