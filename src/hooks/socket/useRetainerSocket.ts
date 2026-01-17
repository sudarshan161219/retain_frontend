import { useEffect } from "react";
import { getSocket } from "@/lib/socket/socket";

export type RetainerUpdatePayload =
  | { type: "ADD_LOG"; log: any }
  | { type: "DELETE_LOG"; logId: string }
  | { type: "STATUS_UPDATE"; status: "ACTIVE" | "PAUSED" | "ARCHIVED" };

export const useRetainerSocket = (
  slug: string,
  onUpdate: (payload: RetainerUpdatePayload) => void
) => {
  useEffect(() => {
    // 1. Don't connect if there is no slug
    if (!slug) return;

    const socket = getSocket();

    // 2. Define the Join Logic
    const handleJoin = () => {
      // console.log(`🔌 Joining room: ${slug}`);

      socket.emit("join-room", slug);
    };

    // 3. Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    } else {
      // If already connected (e.g. navigating between pages), join immediately
      handleJoin();
    }

    // 4. Listen for the specific event from backend
    const handleEvent = (payload: RetainerUpdatePayload) => {
      onUpdate(payload);
    };

    // 5. Attach Event Listeners
    socket.on("connect", handleJoin);
    socket.on("retainer-update", handleEvent);

    // 6. Cleanup on Unmount
    return () => {
      socket.off("connect", handleJoin);
      socket.off("retainer-update", handleEvent);
    };
  }, [slug, onUpdate]);
};
