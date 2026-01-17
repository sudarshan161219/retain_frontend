import { useState, type ReactNode } from "react";
import styles from "./index.module.css";
import type { TabsProps } from "./types/tab.types";

// Helper to render content if no custom wrapper is provided
const DefaultWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) => <div className={className}>{children}</div>;

export const Tabs = ({
  tabs,
  defaultTabId,
  activeId,
  variant = "default",
  renderWrapper,
  onTabChange,
  className,
}: TabsProps) => {
  // Internal state for uncontrolled usage
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTabId || tabs[0]?.id
  );

  // Determine source of truth: Prop (controlled) or State (uncontrolled)
  const currentTabId = activeId !== undefined ? activeId : internalActiveTab;

  const activeTabContent = tabs.find((tab) => tab.id === currentTabId)?.content;
  const wrapperClassName = styles[variant] || styles.default;

  const handleTabClick = (id: string | number) => {
    // Only set internal state if NOT controlled by parent
    if (activeId === undefined) {
      setInternalActiveTab(id);
    }
    // Always notify parent
    onTabChange?.(id);
  };

  return (
    <div className={`${className || styles.tabsContainer}`}>
      {/* Tab Headers */}
      <div className="flex w-full">
        {tabs.map((tab) => {
          const isActive = currentTabId === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`
                 transition-colors duration-200 
                ${styles.button}
                ${variant === "default" ? styles.default : styles.outline}
                ${isActive ? styles.active : ""} 
              `}
              // Move inline styles to CSS module if possible, or keep minimal here
              style={
                isActive ? { backgroundColor: "var(--border)" } : undefined
              }
            >
              <div className={styles.tabs}>
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTabContent &&
        (renderWrapper ? (
          renderWrapper(activeTabContent)
        ) : (
          <DefaultWrapper className={wrapperClassName}>
            {activeTabContent}
          </DefaultWrapper>
        ))}
    </div>
  );
};
