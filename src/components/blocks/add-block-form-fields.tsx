"use client";

import type { Dispatch } from "react";
import type { FormAction, FormState } from "./add-block-form-state";
import { AddBlockMediaFields } from "./add-block-media-fields";
import {
  RichTextAddFields,
  TextAddFields,
  LinkAddFields,
  ButtonAddFields,
  LayoutAddFields,
} from "./add-block-basic-fields";

type Props = {
  state: FormState;
  dispatch: Dispatch<FormAction>;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  handleAddBlock: () => void | Promise<void>;
  handleAISuggestion: () => void | Promise<void>;
  isAILoading: boolean;
  uploading: boolean;
};

const MEDIA_TYPES = new Set([
  "image",
  "video",
  "embed",
  "social-links",
  "calendar",
  "form",
]);

export function AddBlockFormFields(props: Props) {
  const { state } = props;
  if (!state.selectedType) return null;

  if (state.selectedType === "richtext") {
    return <RichTextAddFields {...props} />;
  }
  if (state.selectedType === "text") {
    return <TextAddFields {...props} />;
  }
  if (state.selectedType === "link") {
    return <LinkAddFields {...props} />;
  }
  if (state.selectedType === "button") {
    return <ButtonAddFields {...props} />;
  }
  if (MEDIA_TYPES.has(state.selectedType)) {
    return (
      <AddBlockMediaFields
        state={state}
        dispatch={props.dispatch}
        setField={props.setField}
        handleAddBlock={props.handleAddBlock}
        uploading={props.uploading}
      />
    );
  }
  if (state.selectedType === "divider" || state.selectedType === "spacer") {
    return (
      <LayoutAddFields
        selectedType={state.selectedType}
        handleAddBlock={props.handleAddBlock}
      />
    );
  }
  return null;
}
