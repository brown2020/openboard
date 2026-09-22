"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BoardTheme } from "@/types";
import {
  ThemePresetsPanel,
  ThemeCustomPanel,
  ThemePreviewPanel,
  Palette,
} from "./theme-modal-panels";

type ThemeModalViewProps = {
  selectedTheme: BoardTheme | null;
  customizing: boolean;
  isOpen: boolean;
  handleApplyTheme: (theme: BoardTheme) => void;
  handleCustomColorChange: (key: keyof BoardTheme, value: string) => void;
  handleBackgroundChange: (type: "color" | "gradient", value: string) => void;
  handleSaveCustom: () => void;
  handleReset: () => void;
  handleClose: () => void;
  currentBoard: { title: string; description?: string };
  setSelectedTheme: React.Dispatch<React.SetStateAction<BoardTheme | null>>;
  setCustomizing: (value: boolean) => void;
};

export function ThemeModalView({
  selectedTheme,
  customizing,
  isOpen,
  handleApplyTheme,
  handleCustomColorChange,
  handleBackgroundChange,
  handleSaveCustom,
  handleReset,
  handleClose,
  currentBoard,
  setSelectedTheme,
  setCustomizing,
}: ThemeModalViewProps) {
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Customize Theme
          </SheetTitle>
          <SheetDescription>
            Choose a preset or customize your board&apos;s appearance
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 mt-6">
          <ThemePresetsPanel
            selectedTheme={selectedTheme}
            handleApplyTheme={handleApplyTheme}
            handleReset={handleReset}
          />

          <div className="border-t pt-6">
            <Button
              variant={customizing ? "default" : "outline"}
              onClick={() => setCustomizing(!customizing)}
              className="w-full"
            >
              <Palette className="w-4 h-4 mr-2" />
              {customizing ? "Hide Customization" : "Customize Colors"}
            </Button>
          </div>

          {customizing ? (
            <ThemeCustomPanel
              selectedTheme={selectedTheme}
              handleCustomColorChange={handleCustomColorChange}
              handleBackgroundChange={handleBackgroundChange}
              handleSaveCustom={handleSaveCustom}
              setSelectedTheme={setSelectedTheme}
            />
          ) : null}

          <ThemePreviewPanel
            selectedTheme={selectedTheme}
            title={currentBoard.title}
            description={currentBoard.description || ""}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
