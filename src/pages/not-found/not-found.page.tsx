import { ErrorPage } from "@/shared/ui/error-page";

const NotFoundPage = () => {
  return (
    <ErrorPage
      status={404}
      title="Page Not Found"
      description={
        "Sorry, the page you are looking for doesn't exist or has been moved."
      }
    />
  );
};

export const Component = NotFoundPage;
