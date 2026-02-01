"use client";

import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useBlockFocus } from "@/hooks/use-block-focus";

interface BlockWrapperProps {
  blockId: string;
  children: ReactNode;
  isEditing?: boolean;
  isVisible?: boolean;
  onEnterEdit?: () => void;
  className?: string;
}

/**
 * Wrapper component for blocks that provides:
 * - Visual selection indicator (blue left border like Notion)
 * - Keyboard navigation support
 * - Focus management
 * - Accessibility attributes
 */
export const BlockWrapper = forwardRef<HTMLDivElement, BlockWrapperProps>(
  (
    {
      blockId,
      children,
      isEditing = false,
      isVisible = true,
      onEnterEdit,
      className,
    },
    forwardedRef
  ) => {
    const {
      isSelected,
      isFocused,
      handleFocus,
      handleBlur,
      handleKeyDown,
      blockRef,
    } = useBlockFocus({ blockId, onEnterEdit });

    // Combine refs
    const setRef = (el: HTMLDivElement | null) => {
      blockRef.current = el;
      if (typeof forwardedRef === "function") {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    if (!isEditing) {
      // In view mode, just render children without wrapper
      return <>{children}</>;
    }

    return (
      <div
        ref={setRef}
        data-block-id={blockId}
        tabIndex={0}
        role="listitem"
        aria-selected={isSelected}
        onClick={handleFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative outline-none transition-all duration-150",
          // Selection indicator - blue left border like Notion
          isSelected &&
            "before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500 before:rounded-full",
          // Focus ring for accessibility
          isFocused && "ring-2 ring-blue-500/20 ring-offset-2 rounded-lg",
          // Dim hidden blocks in editor
          !isVisible && "opacity-50",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

BlockWrapper.displayName = "BlockWrapper";
