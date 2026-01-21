import { create } from "zustand";

// 1. Add "REFILL_BALANCE" to the available types
export type ModalType =
  | "WARNING"
  | "CREATE_PROJECT"
  | "EXPORT_REPORT"
  | "REFILL_BALANCE"
  | null;

interface ModalData {
  title?: string; // Made optional since some modals (like Refill) have hardcoded titles
  description?: string | React.ReactNode;
  confirmText?: string;
  variant?: "danger" | "neutral" | "success";
  onConfirm?: () => void | Promise<void>;
}

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: ModalData | null;

  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: null,
  data: null,

  openModal: (type, data = undefined) => set({ isOpen: true, type, data }),

  closeModal: () => set({ isOpen: false, type: null, data: null }),
}));
