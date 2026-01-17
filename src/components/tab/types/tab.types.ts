// import { type ReactNode } from "react";

// export type Tab = {
//   id: number;
//   label: string;
//   themeColor?: string;
//   content: ReactNode;
//   icon?: ReactNode;
//   toggleLight?: () => void;
//   toggleDark?: () => void;
// };

// export interface TabsProps {
//   tabs: Tab[];
//   defaultTabId?: number;
//   mode?: string;
//   variant?: "default" | "outline";
//   toggleTheme?: () => void;
//   renderWrapper?: (children: ReactNode) => ReactNode;
//   onTabChange?: (tabId: number) => void;
// }

import type { ReactNode } from "react";

export interface TabItem {
  id: string | number; // Allow strings for IDs (e.g., "light", "dark")
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
  themeColor?: string; // Optional: keep if you use it elsewhere
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string | number;
  activeId?: string | number; // Added for Controlled mode
  variant?: "default" | "outline";
  className?: string;
  renderWrapper?: (content: ReactNode) => ReactNode;
  onTabChange?: (id: string | number) => void;
}
