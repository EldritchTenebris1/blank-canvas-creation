import * as React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle size={48} />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Oops! Algo deu errado.</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Ocorreu um erro inesperado no sistema. Nossa equipe técnica já foi notificada (simulação).
      </p>
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary} variant="outline" className="flex items-center gap-2">
          <RefreshCcw size={16} /> Tentar novamente
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="default">
          Voltar para o início
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && error instanceof Error && (
        <pre className="mt-8 max-w-full overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
          {error.message}
          {error.stack}
        </pre>
      )}
    </div>
  );
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      {children}
    </ErrorBoundary>
  );
}
