import { CONFIG } from "@/shared/model/config";
import { ErrorPage } from "@/shared/ui/error-page";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function GlobalErrorBoundary() {
  const error = useRouteError();

  const getErrorTitle = (status: number) => {
    if (status === 404) return "Page Not Found";
    else if (status === 400) return "Bad Request";
    return "Error";
  };

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorPage
        status={error.status}
        title={getErrorTitle(error.status)}
        description={error.data || "Something went wrong."}
      />
    );
  } else if (error instanceof Error) {
    return (
      <ErrorPage
        title="Error"
        description={
          <>
            {error.message}
            {CONFIG.DEV && (
              <pre className="text-xs text-left bg-muted p-4 rounded mb-4 w-full">
                <code className="whitespace-pre-wrap">
                  {error.stack}
                </code>
              </pre>
            )}
          </>
        }
      />
    );
  } else {
    return (
      <ErrorPage
        title="Unknown Error"
        description="Something unexpected happened. Please try again."
      />
    );
  }
}
