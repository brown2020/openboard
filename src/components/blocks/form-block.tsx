"use client";

import { useMemo, useState } from "react";
import { FormBlock as FormBlockType } from "@/types";
import { useBoardStore } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, List, Loader2, Type, Mail, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockControls } from "./block-controls";
import { useToast } from "@/stores/ui-store";

type Field = FormBlockType["settings"]["fields"][number];

type SubmitStatus =
  | { state: "idle" }
  | { state: "submitting" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

interface FormBlockProps {
  block: FormBlockType;
  isEditing?: boolean;
  onClick?: () => void;
  boardId?: string;
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
  boardId,
}: FormBlockProps) {
  const { updateBlock } = useBoardStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const { fields, submitText, submitUrl } = block.settings;

  const [editFields, setEditFields] = useState<Field[]>(fields);
  const [editSubmitText, setEditSubmitText] = useState(submitText);
  const [editSubmitUrl, setEditSubmitUrl] = useState(submitUrl || "");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    state: "idle",
  });
  const toast = useToast();

  const usesServerRelay = !isEditing && !!boardId;

  const handleSave = () => {
    const sanitizedFields = editFields
      .map((field) => ({
        ...field,
        label: field.label.trim() || "Field",
        placeholder: field.placeholder?.trim(),
      }))
      .filter((field) => field.label);

    if (sanitizedFields.length === 0) {
      toast.error("Validation error", "Add at least one field.");
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
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
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
    event.preventDefault();

    if (isEditing) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    if (usesServerRelay) {
      if (!submitUrl) {
        setSubmitStatus({
          state: "error",
          message: "This form is not configured to receive submissions yet.",
        });
        return;
      }

      setSubmitStatus({ state: "submitting" });

      try {
        const response = await fetch("/api/forms/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            boardId,
            blockId: block.id,
            data: payload,
            _gotcha: payload._gotcha ?? "",
          }),
        });

        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (!response.ok) {
          setSubmitStatus({
            state: "error",
            message:
              body?.error ?? "Unable to submit form. Please try again later.",
          });
          return;
        }

        event.currentTarget.reset();
        setSubmitStatus({
          state: "success",
          message: "Thanks! Your submission was sent successfully.",
        });
      } catch {
        setSubmitStatus({
          state: "error",
          message: "Unable to submit form. Please try again later.",
        });
      }

      return;
    }

    if (submitUrl) {
      try {
        await fetch(submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Form submitted successfully!");
      } catch {
        toast.error("Unable to submit form", "Please try again later");
      }
    }
  };

  const renderedFields = useMemo(() => fields, [fields]);
  const isSubmitting = submitStatus.state === "submitting";

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

  return (
    <div className="group relative" onClick={onClick}>
      {isEditing && (
        <BlockControls
          blockId={block.id}
          isVisible={block.visible}
          onEdit={() => setIsEditMode(true)}
        />
      )}

      <div
        className={cn(
          "border rounded-lg bg-card p-4",
          !block.visible && isEditing && "opacity-50"
        )}
      >
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor={`${block.id}-gotcha`}>Leave blank</label>
            <input
              id={`${block.id}-gotcha`}
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

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
                  <FieldIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                  {field.label}
                  {field.required && (
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  )}
                </Label>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.id}
                    placeholder={field.placeholder || ""}
                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                    required={field.required}
                    disabled={isEditing || isSubmitting}
                  />
                ) : (
                  <Input
                    type={field.type === "email" ? "email" : "text"}
                    name={field.id}
                    placeholder={field.placeholder || ""}
                    required={field.required}
                    disabled={isEditing || isSubmitting}
                  />
                )}
              </div>
            );
          })}

          {submitStatus.state === "success" && (
            <div
              className="flex items-start gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{submitStatus.message}</span>
            </div>
          )}

          {submitStatus.state === "error" && (
            <div
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {submitStatus.message}
            </div>
          )}

          <Button type="submit" disabled={isEditing || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              submitText
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
