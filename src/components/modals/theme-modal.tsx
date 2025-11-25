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
import { useToastNotification } from "@/components/ui/toast";

export function ThemeModal() {
  const { currentBoard, updateTheme, resetTheme } = useBoardStore();
  const { activeModal, closeModal } = useModal();
  const toast = useToastNotification();
  
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme | null>(null);
  const [customizing, setCustomizing] = useState(false);

  const isOpen = activeModal === "theme";

  // Sync with current board theme
  useEffect(() => {
    if (currentBoard?.theme) {
      setSelectedTheme(currentBoard.theme);
    }
  }, [currentBoard?.theme]);

  if (!currentBoard) return null;

  const handleApplyTheme = (theme: BoardTheme) => {
    setSelectedTheme(theme);
    updateTheme(theme);
    toast.success("Theme applied!", `Applied "${theme.name}" theme to your board`);
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
      toast.success("Custom theme saved!", "Your custom theme has been applied");
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
          {/* Preset Themes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Theme Presets</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {THEME_PRESETS.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleApplyTheme(theme)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200",
                    "hover:scale-[1.02] hover:shadow-lg",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedTheme?.name === theme.name
                      ? "border-primary shadow-md"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{
                    background:
                      theme.background.type === "gradient"
                        ? theme.background.value
                        : theme.background.value,
                  }}
                >
                  {selectedTheme?.name === theme.name && (
                    <div className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-sm">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="text-center py-4">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: theme.textColor }}
                    >
                      {theme.name}
                    </p>
                    <div className="flex justify-center gap-1 mt-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/30 shadow-sm"
                        style={{ backgroundColor: theme.primaryColor }}
                        title="Primary"
                      />
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/30 shadow-sm"
                        style={{ backgroundColor: theme.cardBackground }}
                        title="Card"
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Theme Toggle */}
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

          {/* Custom Colors */}
          {customizing && (
            <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker
                  label="Primary Color"
                  value={selectedTheme?.primaryColor || "#000000"}
                  onChange={(value) =>
                    handleCustomColorChange("primaryColor", value)
                  }
                />
                <ColorPicker
                  label="Text Color"
                  value={selectedTheme?.textColor || "#000000"}
                  onChange={(value) =>
                    handleCustomColorChange("textColor", value)
                  }
                />
                <ColorPicker
                  label="Card Background"
                  value={selectedTheme?.cardBackground || "#f5f5f5"}
                  onChange={(value) =>
                    handleCustomColorChange("cardBackground", value)
                  }
                />
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={
                        selectedTheme?.background.type === "color"
                          ? selectedTheme.background.value
                          : "#ffffff"
                      }
                      onChange={(e) =>
                        handleBackgroundChange("color", e.target.value)
                      }
                      className="w-14 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={
                        selectedTheme?.background.type === "color"
                          ? selectedTheme.background.value
                          : ""
                      }
                      onChange={(e) =>
                        handleBackgroundChange("color", e.target.value)
                      }
                      className="flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <Label>Border Radius</Label>
                <Select
                  value={selectedTheme?.borderRadius || "md"}
                  onValueChange={(value) =>
                    setSelectedTheme((prev) =>
                      prev
                        ? {
                            ...prev,
                            borderRadius: value as BoardTheme["borderRadius"],
                            name: "Custom",
                          }
                        : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gradient Background Option */}
              <div className="space-y-2">
                <Label>Gradient Background (CSS)</Label>
                <Input
                  value={
                    selectedTheme?.background.type === "gradient"
                      ? selectedTheme.background.value
                      : ""
                  }
                  onChange={(e) =>
                    handleBackgroundChange("gradient", e.target.value)
                  }
                  placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a CSS gradient value to use as background
                </p>
              </div>

              <Button onClick={handleSaveCustom} className="w-full">
                Save Custom Theme
              </Button>
            </div>
          )}

          {/* Live Preview */}
          <div>
            <h3 className="font-semibold mb-4">Preview</h3>
            <div
              className="p-6 rounded-xl border transition-all duration-300"
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
                {currentBoard.title || "Sample Board Title"}
              </h4>
              <p
                className="text-sm mb-4 opacity-80"
                style={{ color: selectedTheme?.textColor }}
              >
                {currentBoard.description || "This is how your board will look"}
              </p>
              <div
                className="p-4 mt-4 transition-all duration-300"
                style={{
                  backgroundColor: selectedTheme?.cardBackground,
                  color: selectedTheme?.textColor,
                  borderRadius:
                    selectedTheme?.borderRadius === "none"
                      ? "0"
                      : selectedTheme?.borderRadius === "sm"
                        ? "0.25rem"
                        : selectedTheme?.borderRadius === "md"
                          ? "0.5rem"
                          : selectedTheme?.borderRadius === "lg"
                            ? "0.75rem"
                            : "1rem",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Sample Link Block</span>
                  <span className="text-sm opacity-60">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Reusable Color Picker Component
 */
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-10 p-1 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
