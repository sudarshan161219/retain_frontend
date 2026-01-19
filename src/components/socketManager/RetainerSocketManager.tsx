import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket/socket";
import { toast } from "sonner";

// Types matching your backend emit payload
type RetainerUpdatePayload =
  | { type: "ADD_LOG"; log: any }
  | { type: "DELETE_LOG"; logId: string }
  | { type: "STATUS_UPDATE"; status: "ACTIVE" | "PAUSED" | "ARCHIVED" }
  | {
      type: "DETAILS_UPDATE";
      client: {
        name?: string;
        totalHours?: number;
        refillLink?: string | null;
      };
    }
  | { type: "PROJECT_DELETED"; client: { id?: number } };

interface RetainerSocketManagerProps {
  slug: string;
}

export const RetainerSocketManager = ({ slug }: RetainerSocketManagerProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!slug) return;

    const socket = getSocket();
    const queryKey = ["client", slug]; // Matches your React Query Key

    // 1. Connection Logic
    const handleJoin = () => {
      // console.log(`🔌 Client Connected! Joining room: ${slug}`);
      socket.emit("join-room", slug);
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      handleJoin();
    }

    // 2. Unified Event Handler
    const handleUpdate = (payload: RetainerUpdatePayload) => {
      // console.log("⚡ Retainer Update:", payload);

      if (payload.type === "PROJECT_DELETED") {
        queryClient.setQueryData(queryKey, null);
        queryClient.removeQueries({ queryKey });
        toast.error("This project has been deleted.");
        return;
      }

      queryClient.setQueryData(queryKey, (oldClient: any) => {
        if (!oldClient) return undefined;

        switch (payload.type) {
          case "ADD_LOG":
            return {
              ...oldClient,
              // Add new log to the TOP of the array
              logs: [payload.log, ...oldClient.logs],
            };

          case "DELETE_LOG":
            return {
              ...oldClient,
              // Filter out the deleted log
              logs: oldClient.logs.filter(
                (log: any) => log.id !== payload.logId,
              ),
            };

          case "STATUS_UPDATE":
            return {
              ...oldClient,
              status: payload.status,
            };

          case "DETAILS_UPDATE":
            return {
              ...oldClient,
              ...payload.client,
            };

          default:
            return oldClient;
        }
      });
    };

    // 3. Attach Listeners
    socket.on("connect", handleJoin);
    socket.on("retainer-update", handleUpdate);
    // 4. Cleanup
    return () => {
      // console.log(`🔌 Leaving room: ${slug}`);
      socket.emit("leave-room", slug);
      socket.off("connect", handleJoin);
      socket.off("retainer-update", handleUpdate);
    };
  }, [slug, queryClient]);

  return null;
};
