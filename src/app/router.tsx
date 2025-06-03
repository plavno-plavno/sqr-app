import { ROUTES } from "@/shared/models/routes";
import { createBrowserRouter } from "react-router";
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
        path: ROUTES.HOME,
        lazy: () => import("@/pages/home/home.page"),
      },
    ],
  },
]);
