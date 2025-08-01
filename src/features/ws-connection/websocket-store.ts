import { createSelectors } from "@/shared/lib/js/zustand";
import type { WebSocketConnection } from "@/shared/lib/websocket/websocket-connection";
import { create } from "zustand";

interface State {
  connection: WebSocketConnection | null;
  isConnecting: boolean;
  isConnected: boolean;
  wsError: string | null;
}

interface Actions {
  setConnection: (connection: WebSocketConnection | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  setWsError: (wsError: string | null) => void;
}

type Store = State & Actions;

const useWebSocketStoreBase = create<Store>()((set) => ({
  connection: null,
  isConnecting: false,
  isConnected: false,
  wsError: null,

  setConnection: (connection) => set({ connection }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setWsError: (wsError) => set({ wsError }),
}));

export const useWebSocketStore = createSelectors(useWebSocketStoreBase);
