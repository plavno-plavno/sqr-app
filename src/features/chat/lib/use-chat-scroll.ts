import { useEffect, useRef } from "react";

export const useChatScroll = (
  containerRef: React.RefObject<HTMLDivElement>
) => {
  const newMessageIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver((mutationList: MutationRecord[]) => {
      for (const mutation of mutationList) {
        if (mutation.type !== "childList") return;

        const newMessages: HTMLElement[] = [];

        // Collect only new messages
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const messageId = node.id;

          if (!messageId || newMessageIdsRef.current.has(messageId)) return;

          newMessages.push(node);
          newMessageIdsRef.current.add(messageId);
        });

        newMessages.forEach((message) =>
          message.scrollIntoView({ behavior: "smooth", block: "start" })
        );
      }
    });

    observer.observe(containerRef.current, {
      childList: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);
};
