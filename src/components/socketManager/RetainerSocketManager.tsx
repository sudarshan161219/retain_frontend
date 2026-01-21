import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket/socket";
import { toast } from "sonner";
import type {
  RetainerLog,
  Retainer,
  RetainerStatus,
} from "@/types/retainer/retainer";

type RetainerUpdatePayload =
  | { type: "ADD_LOG"; data: RetainerLog }
  | { type: "REFILL"; data: { totalHours: number; log: RetainerLog } }
  | { type: "DELETE_LOG"; data: string }
  | { type: "STATUS_UPDATE"; data: { status: RetainerStatus } }
  | { type: "DETAILS_UPDATE"; data: Partial<Retainer> }
  | { type: "PROJECT_DELETED"; data: any };

interface RetainerSocketManagerProps {
  slug: string;
}

export const RetainerSocketManager = ({ slug }: RetainerSocketManagerProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!slug) return;

    const socket = getSocket();
    const queryKey = ["client", slug];

    // 1. Connection Logic
    const handleJoin = () => {
      socket.emit("join-room", slug);
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      handleJoin();
    }

    // 2. Unified Event Handler
    const handleUpdate = (payload: RetainerUpdatePayload) => {
      if (payload.type === "PROJECT_DELETED") {
        queryClient.setQueryData(queryKey, null);
        queryClient.removeQueries({ queryKey });
        toast.error("This project has been deleted.");
        return;
      }

      queryClient.setQueryData(queryKey, (oldClient: Retainer | undefined) => {
        if (!oldClient) return undefined;

        // ✅ Extract 'data' once to keep switch cases clean
        // const { data } = payload;

        // if (!data) return undefined;
        switch (payload.type) {
          case "ADD_LOG":
            // data IS the new log object
            return {
              ...oldClient,
              logs: [payload.data, ...oldClient.logs],
            };

          case "REFILL":
            return {
              ...oldClient,
              totalHours: payload.data.totalHours,
              logs: payload.data.log
                ? [payload.data.log, ...oldClient.logs]
                : oldClient.logs,
            };

          case "DELETE_LOG":
            // data IS the log ID string
            return {
              ...oldClient,
              logs: oldClient.logs.filter((log) => log.id !== payload.data),
            };

          case "STATUS_UPDATE":
            // data IS { status: "..." }
            return {
              ...oldClient,
              status: payload.data.status,
            };

          case "DETAILS_UPDATE":
            // data IS the updated client fields
            return {
              ...oldClient,
              ...payload.data,
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
      socket.emit("leave-room", slug);
      socket.off("connect", handleJoin);
      socket.off("retainer-update", handleUpdate);
    };
  }, [slug, queryClient]);

  return null;
};
