"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dispatch } from "react";
import type { FormAction, FormState } from "./add-block-form-state";
import type { SocialLinksBlock, CalendarBlock } from "@/types";

type Props = {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  handleAddBlock: () => void | Promise<void>;
};

export function AddBlockAdvancedFields({
  state,
  dispatch,
  setField,
  handleAddBlock,
}: Props) {
  switch (state.selectedType) {
      case "social-links":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select
                value={state.socialLayout}
                onValueChange={(v) =>
                  setField(
                    "socialLayout",
                    v as SocialLinksBlock["settings"]["layout"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {state.socialLinks.map((link, index) => (
                <div key={`${link.platform}-${link.url}`} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Link {index + 1}</span>
                    {state.socialLinks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          dispatch({ type: "REMOVE_SOCIAL_LINK", index })
                        }
                        className="h-6 px-2 text-muted-foreground"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Platform Label</Label>
                    <Input
                      placeholder="Instagram"
                      value={link.platform}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_SOCIAL_LINK",
                          index,
                          field: "platform",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      placeholder="https://instagram.com/username"
                      value={link.url}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_SOCIAL_LINK",
                          index,
                          field: "url",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon (emoji or text)</Label>
                    <Input
                      placeholder="📸"
                      maxLength={4}
                      value={link.icon}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_SOCIAL_LINK",
                          index,
                          field: "icon",
                          value: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "ADD_SOCIAL_LINK" })}
              className="w-full"
            >
              Add Another Link
            </Button>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={state.socialLinks.every((link) => !link.url)}
            >
              Add Social Links
            </Button>
          </div>
        );
      case "calendar":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={state.calendarProvider}
                onValueChange={(v) =>
                  setField(
                    "calendarProvider",
                    v as CalendarBlock["settings"]["provider"]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cal">Cal.com</SelectItem>
                  <SelectItem value="calendly">Calendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-url">Booking URL</Label>
              <Input
                id="calendar-url"
                placeholder={
                  state.calendarProvider === "cal"
                    ? "https://cal.com/username"
                    : "https://calendly.com/username"
                }
                value={state.calendarUrl}
                onChange={(e) => setField("calendarUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar-title">Title (optional)</Label>
              <Input
                id="calendar-title"
                placeholder="Book a call"
                value={state.calendarTitle}
                onChange={(e) => setField("calendarTitle", e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBlock}
              disabled={!state.calendarUrl}
            >
              Add Calendar
            </Button>
          </div>
        );
      case "form":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Submit Button Text</Label>
              <Input
                value={state.formSubmitText}
                onChange={(e) => setField("formSubmitText", e.target.value)}
                placeholder="Send"
              />
            </div>
            <div className="space-y-2">
              <Label>Submit URL (optional)</Label>
              <Input
                value={state.formSubmitUrl}
                onChange={(e) => setField("formSubmitUrl", e.target.value)}
                placeholder="https://example.com/forms"
              />
              <p className="text-xs text-muted-foreground">
                When provided, submissions will POST JSON to this endpoint.
              </p>
            </div>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
              {state.formFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Field {index + 1}</span>
                    {state.formFields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          dispatch({ type: "REMOVE_FORM_FIELD", index })
                        }
                        className="h-6 px-2 text-muted-foreground"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full rounded-md border px-2 py-1 text-sm"
                      value={field.type}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "type",
                          value: e.target.value,
                        })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="textarea">Textarea</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "label",
                          value: e.target.value,
                        })
                      }
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder (optional)</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "placeholder",
                          value: e.target.value,
                        })
                      }
                      placeholder="Enter name..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`form-required-${field.id}`}
                      checked={field.required}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FORM_FIELD",
                          index,
                          field: "required",
                          value: e.target.checked,
                        })
                      }
                    />
                    <Label
                      htmlFor={`form-required-${field.id}`}
                      className="text-sm"
                    >
                      Required
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "ADD_FORM_FIELD" })}
              className="w-full"
            >
              Add Field
            </Button>
            <Button className="w-full" onClick={handleAddBlock}>
              Add Form
            </Button>
          </div>
        );

    default:
      return null;
  }
}
