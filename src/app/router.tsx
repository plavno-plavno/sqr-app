import { ROUTES } from "@/shared/model/routes";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./app";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.DEMO,
        lazy: () => import("@/pages/demo/demo.page"),
      },
      {
        path: ROUTES.CHAT,
        lazy: () => import("@/pages/chat/chat.page"),
      },
      {
        path: ROUTES.PAYMENTS,
        lazy: () => import("@/pages/payments/payments.page"),
      },
      {
        path: ROUTES.HOME,
        lazy: () => import("@/pages/home/home.page"),
      },
    ],
  },
]);
