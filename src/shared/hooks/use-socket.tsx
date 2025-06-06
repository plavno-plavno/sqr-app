import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";

export type EventsEnums = "initial" | "streaming" | "closed";

export const useSocket = ({
  socketBaseUrl,
}: {
  socketBaseUrl: string | undefined;
}) => {
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);

  const { current } = useRef<{
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  }>({ socket: null });

  const eventHandlers: RefObject<Record<string, (...args: unknown[]) => void>> =
    useRef({});

  // socket initialization
  useEffect(() => {
    if (!socketBaseUrl) return;
    current.socket = io(socketBaseUrl, {
      transports: ["websocket"],
    });

    current.socket.on("connect", () => {
      setIsSocketConnected(!!current.socket?.connected);
    });

    return () => {
      if (socketBaseUrl) {
        current.socket?.off("connect");
        current.socket?.close();
        current.socket?.on("disconnect", () => {
          setIsSocketConnected(false);
        });
      }
    };
  }, [current, socketBaseUrl]);

  const emitEvent = useCallback(
    (event: EventsEnums, data: unknown) => {
      current.socket?.emit(event, data);
    },
    [current.socket]
  );

  const subscribeToEvents = useCallback(
    (event: EventsEnums, cb: (...args: unknown[]) => void) => {
      eventHandlers.current[event] = cb;
      current.socket?.on(event, cb);
    },
    [current.socket]
  );

  const unsubscribeToEvents = useCallback(
    (event: EventsEnums) => {
      if (eventHandlers.current[event]) {
        current.socket?.off(event, eventHandlers.current[event]);
        delete eventHandlers.current[event];
      }
    },
    [current.socket]
  );

  return {
    isSocketConnected,
    socket: current.socket,
    emitEvent,
    subscribeToEvents,
    unsubscribeToEvents,
  };
};
