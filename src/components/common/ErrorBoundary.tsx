"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors in the component tree beneath it and shows a
 * graceful recovery UI instead of a blank/crashed page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would report to a monitoring service.
    console.error("SRMS ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-rose-300/40 bg-rose-50/40 dark:bg-rose-500/5 p-10 text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
            <AlertTriangle size={26} />
          </div>
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h3>
          <p className="max-w-md text-sm text-navy-400">
            {this.state.error?.message ?? "An unexpected error occurred while rendering this section."}
          </p>
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            <RotateCcw size={14} /> Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
