import { Button } from "@/shared/ui/kit/button";
import { ROUTES } from "@/shared/model/routes";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface ErrorPageProps {
  status?: number | string;
  title?: string;
  description?: React.ReactNode;
  homeText?: string;
  backText?: string;
  showBack?: boolean;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  status,
  title = "Error",
  description = "Something went wrong.",
  homeText = "Go to Home",
  backText = "Go Back",
  showBack = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      {status && (
        <div className="text-6xl font-bold text-primary mb-4">{status}</div>
      )}
      {title && (
        <h1 className="text-2xl font-semibold text-foreground mb-4">{title}</h1>
      )}
      {description && (
        <div className="text-muted-foreground mb-8">{description}</div>
      )}
      <div className="flex flex-col gap-2 w-full">
        <Link to={ROUTES.HOME} className="block">
          <Button className="w-full">{homeText}</Button>
        </Link>
        {showBack && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(-1)}
          >
            {backText}
          </Button>
        )}
      </div>
    </div>
  );
};
