import { useModalStore } from "@/store/modalStore/useModalStore";
import { ExportModal } from "../exportModal/ExportModal";
import { RefillModal } from "../refillModal/RefillModal";
import { WarningModal } from "../WarningModal/WarningModal"; // We will create this below

export const ModalManager = () => {
  const { isOpen, type } = useModalStore();

  // 1. If closed, render nothing
  if (!isOpen) return null;

  // 2. Render the specific component based on type
  switch (type) {
    case "EXPORT_REPORT":
      return <ExportModal />;

    case "REFILL_BALANCE":
      return <RefillModal />;

    case "WARNING":
      return <WarningModal />;

    default:
      return null;
  }
};
