"use client";

import { useMemo, useState } from "react";
import { FormBlock as FormBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Edit2,
  Eye,
  EyeOff,
  Trash2,
  List,
  Type,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Field = FormBlockType["settings"]["fields"][number];

interface FormBlockProps {
  block: FormBlockType;
  isEditing?: boolean;
  onClick?: () => void;
}

const FIELD_OPTIONS: Array<{ type: Field["type"]; label: string }> = [
  { type: "text", label: "Text" },
  { type: "email", label: "Email" },
  { type: "textarea", label: "Textarea" },
];

export function FormBlock({
  block,
  isEditing = false,
  onClick,
}: FormBlockProps) {
  const { updateBlock, deleteBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { fields, submitText, submitUrl } = block.settings;

  const [editFields, setEditFields] = useState<Field[]>(fields);
  const [editSubmitText, setEditSubmitText] = useState(submitText);
  const [editSubmitUrl, setEditSubmitUrl] = useState(submitUrl || "");

  const toggleVisibility = () => {
    updateBlock(block.id, { visible: !block.visible });
  };

  const handleDelete = () => {
    if (confirm("Delete this form block?")) {
      deleteBlock(block.id);
    }
  };

  const handleSave = () => {
    const sanitizedFields = editFields
      .map((field) => ({
        ...field,
        label: field.label.trim() || "Field",
        placeholder: field.placeholder?.trim(),
      }))
      .filter((field) => field.label);

    if (sanitizedFields.length === 0) {
      alert("Add at least one field.");
      return;
    }

    updateBlock(block.id, {
      settings: {
        fields: sanitizedFields,
        submitText: editSubmitText || "Submit",
        submitUrl: editSubmitUrl || undefined,
      },
    });
    setIsEditMode(false);
  };

  const handleFieldChange = (
    index: number,
    field: keyof Field,
    value: string | boolean
  ) => {
    setEditFields((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddField = () => {
    setEditFields((prev) => [
      ...prev,
      {
        id: `field_${Date.now()}`,
        type: "text",
        label: "Untitled field",
        required: false,
      },
    ]);
  };

  const handleRemoveField = (index: number) => {
    if (editFields.length === 1) return;
    setEditFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (submitUrl) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(formData.entries());
      try {
        await fetch(submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        alert("Form submitted!");
      } catch (error) {
        console.error("Form submission error:", error);
        alert("Unable to submit form. Please try again later.");
      }
    }
  };

  const renderedFields = useMemo(() => fields, [fields]);

  if (isEditMode && isEditing) {
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
          <Label>Submit URL (optional)</Label>
          <Input
            value={editSubmitUrl}
            onChange={(e) => setEditSubmitUrl(e.target.value)}
            placeholder="https://example.com/forms"
          />
          <p className="text-xs text-muted-foreground">
            When provided, submissions POST JSON to this URL.
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

  return (
    <div className="group relative" onClick={onClick}>
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditMode(true)}
            className="h-7 w-7 p-0 shadow-md"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleVisibility}
            className="h-7 w-7 p-0 shadow-md"
          >
            {block.visible ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="h-7 w-7 p-0 shadow-md"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "border rounded-lg bg-card p-4",
          !block.visible && isEditing && "opacity-50"
        )}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {renderedFields.map((field) => {
            const FieldIcon =
              field.type === "email"
                ? Mail
                : field.type === "textarea"
                ? List
                : Type;
            return (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FieldIcon className="w-4 h-4 text-primary" />
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.id}
                    placeholder={field.placeholder || ""}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                    required={field.required}
                    disabled={isEditing}
                  />
                ) : (
                  <Input
                    type={field.type === "email" ? "email" : "text"}
                    name={field.id}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    disabled={isEditing}
                  />
                )}
              </div>
            );
          })}
          <Button type="submit" disabled={isEditing}>
            {submitText}
          </Button>
        </form>
      </div>
    </div>
  );
}
