"use client";

import { useState, useEffect } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useModal } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BoardTheme } from "@/types";
import { THEME_PRESETS } from "@/lib/constants";
import { Check, RotateCcw, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/stores/ui-store";
import { ColorPicker } from "@/components/ui/color-picker";

import { ThemeModalView } from "./theme-modal-view";

export function ThemeModal() {
  const { currentBoard, updateTheme, resetTheme } = useBoardStore();
  const { activeModal, closeModal } = useModal();
  const toast = useToast();

  const [selectedTheme, setSelectedTheme] = useState<BoardTheme | null>(null);
  const [customizing, setCustomizing] = useState(false);

  const isOpen = activeModal === "theme";

  // Sync with current board theme when modal opens
  useEffect(() => {
    if (isOpen && currentBoard?.theme) {
      setSelectedTheme(currentBoard.theme);
    }
  }, [isOpen, currentBoard?.id, currentBoard?.theme]);

  if (!currentBoard) return null;

  const handleApplyTheme = (theme: BoardTheme) => {
    setSelectedTheme(theme);
    updateTheme(theme);
    toast.success(
      "Theme applied!",
      `Applied "${theme.name}" theme to your board`
    );
  };

  const handleCustomColorChange = (key: keyof BoardTheme, value: string) => {
    if (!selectedTheme) return;

    const updatedTheme = {
      ...selectedTheme,
      [key]: value,
      name: "Custom",
    };

    setSelectedTheme(updatedTheme);
  };

  const handleBackgroundChange = (
    type: "color" | "gradient",
    value: string
  ) => {
    if (!selectedTheme) return;

    const updatedTheme = {
      ...selectedTheme,
      background: { type, value },
      name: "Custom",
    };

    setSelectedTheme(updatedTheme);
  };

  const handleSaveCustom = () => {
    if (selectedTheme) {
      updateTheme(selectedTheme);
      toast.success(
        "Custom theme saved!",
        "Your custom theme has been applied"
      );
      setCustomizing(false);
    }
  };

  const handleReset = () => {
    resetTheme();
    setSelectedTheme(THEME_PRESETS[0]);
    toast.info("Theme reset", "Board theme has been reset to default");
  };

  const handleClose = () => {
    closeModal();
    setCustomizing(false);
  };


  return (
    <ThemeModalView
      selectedTheme={selectedTheme}
      customizing={customizing}
      isOpen={isOpen}
      handleApplyTheme={handleApplyTheme}
      handleCustomColorChange={handleCustomColorChange}
      handleBackgroundChange={handleBackgroundChange}
      handleSaveCustom={handleSaveCustom}
      handleReset={handleReset}
      handleClose={handleClose}
      currentBoard={currentBoard}
      setSelectedTheme={setSelectedTheme}
      setCustomizing={setCustomizing}
    />
  );
}
