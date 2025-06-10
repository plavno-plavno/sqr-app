import "react-router-dom";

export const ROUTES = {
  HOME: "/",
  DEMO: "/demo",
  PAYMENTS: "/payments",
  CHAT: "/chat/:chatId",
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
