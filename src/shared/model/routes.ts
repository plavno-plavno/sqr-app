import "react-router-dom";

export const ROUTES = {
  HOME: "/",
  FINANCE: "/finance",
  PAYMENTS: "/payments",
  INVEST: "/invest",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
  CHAT: "/chat/:chatId",
  DEMO: "/demo",
  APP_TEST: "/app-test",
} as const;

export type PathParams = {
  [ROUTES.CHAT]: {
    chatId: string;
  };
};

declare module "react-router-dom" {
  interface Register {
    params: PathParams;
  }
}
