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
 * Wrapper for blocks: selection indicator, keyboard nav, focus management.
 */
export const BlockWrapper = forwardRef<HTMLLIElement, BlockWrapperProps>(
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

    const setLiRef = (el: HTMLLIElement | null) => {
      if (typeof forwardedRef === "function") {
        forwardedRef(el);
      } else if (forwardedRef) {
        forwardedRef.current = el;
      }
    };

    const setButtonRef = (el: HTMLButtonElement | null) => {
      blockRef.current = el;
    };

    if (!isEditing) {
      return <>{children}</>;
    }

    return (
      <li ref={setLiRef} className={cn("relative list-none", className)}>
        <button
          ref={setButtonRef}
          type="button"
          data-block-id={blockId}
          data-selected={isSelected || undefined}
          onClick={handleFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative w-full text-left outline-none transition-[box-shadow,opacity] duration-150",
            isSelected &&
              "before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-500 before:rounded-full",
            isFocused && "ring-2 ring-blue-500/20 ring-offset-2 rounded-lg",
            !isVisible && "opacity-50"
          )}
        >
          {children}
        </button>
      </li>
    );
  }
);

BlockWrapper.displayName = "BlockWrapper";
