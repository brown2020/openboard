"use client";

import { useState } from "react";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
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
import { BoardTheme } from "@/types";
import { THEME_PRESETS } from "@/lib/constants";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeModal() {
  const { currentBoard, updateBoard } = useBoardStore();
  const { showThemeModal, closeModal } = useUIStore();
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme | null>(
    currentBoard?.theme || null
  );

  if (!currentBoard) return null;

  const handleApplyTheme = (theme: BoardTheme) => {
    setSelectedTheme(theme);
    updateBoard(currentBoard.id, { theme });
  };

  const handleCustomColorChange = (key: string, value: string) => {
    if (!selectedTheme) return;

    const updatedTheme = {
      ...selectedTheme,
      [key]: value,
    };

    setSelectedTheme(updatedTheme);
  };

  const handleSaveCustom = () => {
    if (selectedTheme) {
      updateBoard(currentBoard.id, { theme: selectedTheme });
    }
  };

  return (
    <Sheet
      open={showThemeModal}
      onOpenChange={() => closeModal("showThemeModal")}
    >
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customize Theme</SheetTitle>
          <SheetDescription>
            Choose a preset or customize your board&apos;s appearance
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 mt-6">
          {/* Preset Themes */}
          <div>
            <h3 className="font-semibold mb-4">Theme Presets</h3>
            <div className="grid grid-cols-2 gap-4">
              {THEME_PRESETS.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleApplyTheme(theme)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all hover:scale-105",
                    selectedTheme?.name === theme.name
                      ? "border-primary"
                      : "border-border"
                  )}
                  style={{
                    background:
                      theme.background.type === "gradient"
                        ? theme.background.value
                        : theme.background.value,
                  }}
                >
                  {selectedTheme?.name === theme.name && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="text-center">
                    <p
                      className="font-semibold"
                      style={{ color: theme.textColor }}
                    >
                      {theme.name}
                    </p>
                    <div
                      className="mt-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div>
            <h3 className="font-semibold mb-4">Custom Colors</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={selectedTheme?.primaryColor || "#000000"}
                      onChange={(e) =>
                        handleCustomColorChange("primaryColor", e.target.value)
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={selectedTheme?.primaryColor || "#000000"}
                      onChange={(e) =>
                        handleCustomColorChange("primaryColor", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={selectedTheme?.textColor || "#000000"}
                      onChange={(e) =>
                        handleCustomColorChange("textColor", e.target.value)
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={selectedTheme?.textColor || "#000000"}
                      onChange={(e) =>
                        handleCustomColorChange("textColor", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardBackground">Card Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cardBackground"
                      type="color"
                      value={selectedTheme?.cardBackground || "#f5f5f5"}
                      onChange={(e) =>
                        handleCustomColorChange(
                          "cardBackground",
                          e.target.value
                        )
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={selectedTheme?.cardBackground || "#f5f5f5"}
                      onChange={(e) =>
                        handleCustomColorChange(
                          "cardBackground",
                          e.target.value
                        )
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bgColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgColor"
                      type="color"
                      value={
                        selectedTheme?.background.type === "color"
                          ? selectedTheme.background.value
                          : "#ffffff"
                      }
                      onChange={(e) => {
                        if (selectedTheme) {
                          const updatedTheme = {
                            ...selectedTheme,
                            background: {
                              type: "color" as const,
                              value: e.target.value,
                            },
                          };
                          setSelectedTheme(updatedTheme);
                        }
                      }}
                      className="w-20 h-10"
                    />
                    <Input
                      value={
                        selectedTheme?.background.type === "color"
                          ? selectedTheme.background.value
                          : "#ffffff"
                      }
                      onChange={(e) => {
                        if (selectedTheme) {
                          const updatedTheme = {
                            ...selectedTheme,
                            background: {
                              type: "color" as const,
                              value: e.target.value,
                            },
                          };
                          setSelectedTheme(updatedTheme);
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveCustom} className="w-full">
                Save Custom Theme
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-semibold mb-4">Preview</h3>
            <div
              className="p-6 rounded-lg"
              style={{
                background:
                  selectedTheme?.background.type === "gradient"
                    ? selectedTheme.background.value
                    : selectedTheme?.background.value,
              }}
            >
              <h4
                className="text-xl font-bold mb-2"
                style={{ color: selectedTheme?.textColor }}
              >
                Sample Board Title
              </h4>
              <div
                className="p-4 rounded-lg mt-4"
                style={{
                  backgroundColor: selectedTheme?.cardBackground,
                  color: selectedTheme?.textColor,
                }}
              >
                Sample link block
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
