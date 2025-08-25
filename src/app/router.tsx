import { ROUTES } from "@/shared/model/routes";
import { GlobalErrorBoundary } from "./global-error-boundary";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./app";

export const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: () => import("@/pages/home/home.page"),
      },
      {
        path: ROUTES.SETTINGS,
        lazy: () => import("@/pages/settings/settings.page"),
      },
      {
        path: ROUTES.CHAT,
        lazy: () => import("@/pages/chat/chat.page"),
      },
      {
        path: ROUTES.APP_TEST,
        lazy: () => import("@/pages/app-test/app-test.page"),
      },
      {
        path: "*",
        lazy: () => import("@/pages/not-found/not-found.page"),
      },
    ],
  },
]);
