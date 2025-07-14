import { ROUTES } from "@/shared/model/routes";
import { createBrowserRouter } from "react-router-dom";
import { App } from "./app";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: ROUTES.HOME,
        lazy: () => import("@/pages/home/home.page"),
      },
      {
        path: ROUTES.FINANCE,
        lazy: () => import("@/pages/finance/finance.page"),
      },
      {
        path: ROUTES.PAYMENTS,
        lazy: () => import("@/pages/payments/payments.page"),
      },
      {
        path: ROUTES.INVEST,
        lazy: () => import("@/pages/invest/invest.page"),
      },
      {
        path: ROUTES.ANALYTICS,
        lazy: () => import("@/pages/analytics/analytics.page"),
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
        path: ROUTES.DEMO,
        lazy: () => import("@/pages/demo/demo.page"),
      },
      {
        path: ROUTES.MICROPHONE_TEST,
        lazy: () => import("@/pages/test-noize-cancelation/noize-cancelation.page"),
      },
    ],
  },
]);
