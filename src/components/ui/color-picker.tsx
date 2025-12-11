"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Reusable Color Picker Component
 * Combines a color input with a text input for direct hex value entry
 */
export function ColorPicker({
  label,
  value,
  onChange,
  className,
}: ColorPickerProps) {
  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
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
