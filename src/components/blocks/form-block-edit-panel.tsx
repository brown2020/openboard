"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
};

type Props = {
  editSubmitText: string;
  setEditSubmitText: (v: string) => void;
  editSubmitUrl: string;
  setEditSubmitUrl: (v: string) => void;
  editFields: Field[];
  handleFieldChange: (index: number, key: string, value: string | boolean) => void;
  handleRemoveField: (index: number) => void;
  handleAddField: () => void;
  handleSave: () => void;
  setIsEditMode: (v: boolean) => void;
  FIELD_OPTIONS: Array<{ type: string; label: string }>;
};

export function FormBlockEditPanel(props: Props) {
  const {
    editSubmitText,
    setEditSubmitText,
    editSubmitUrl,
    setEditSubmitUrl,
    editFields,
    handleFieldChange,
    handleRemoveField,
    handleAddField,
    handleSave,
    setIsEditMode,
    FIELD_OPTIONS,
  } = props;
  return (

      <div className="p-4 border rounded-lg bg-card space-y-4">
        <div className="space-y-2">
          <Label>Submit Button Text</Label>
          <Input
            value={editSubmitText}
            onChange={(e) => setEditSubmitText(e.target.value)}
            placeholder="Submit"
          />
        </div>
        <div className="space-y-2">
          <Label>Webhook URL (optional)</Label>
          <Input
            value={editSubmitUrl}
            onChange={(e) => setEditSubmitUrl(e.target.value)}
            placeholder="https://example.com/webhook"
          />
          <p className="text-xs text-muted-foreground">
            Public submissions are relayed through OpenBoard to this URL to avoid
            browser CORS issues.
          </p>
        </div>
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
          {editFields.map((field, index) => (
            <div
              key={field.id}
              className="border rounded-lg p-3 space-y-3 bg-background"
            >
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Field {index + 1}</span>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded-md px-2 py-1 text-xs"
                    value={field.type}
                    onChange={(e) =>
                      handleFieldChange(index, "type", e.target.value)
                    }
                  >
                    {FIELD_OPTIONS.map((option) => (
                      <option key={option.type} value={option.type}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {editFields.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(index)}
                      className="h-6 px-2 text-muted-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={field.label}
                  onChange={(e) =>
                    handleFieldChange(index, "label", e.target.value)
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Placeholder (optional)</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) =>
                    handleFieldChange(index, "placeholder", e.target.value)
                  }
                  placeholder="Enter name..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`required-${field.id}`}
                  checked={field.required}
                  onChange={(e) =>
                    handleFieldChange(index, "required", e.target.checked)
                  }
                />
                <Label htmlFor={`required-${field.id}`} className="text-sm">
                  Required
                </Label>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddField}
          className="w-full"
        >
          Add Field
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
            Cancel
          </Button>
        </div>
      </div>
    
  );
}
