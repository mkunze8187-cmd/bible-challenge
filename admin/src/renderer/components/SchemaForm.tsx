import type { ReactNode } from "react";
import type { FieldDescriptor } from "../../lib/formRenderer";
import { emptyValueForField } from "../../lib/formRenderer";

interface SchemaFormProps {
  fields: FieldDescriptor[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

// Renders one form per FieldDescriptor list — used both for a round's top-level fields and
// recursively for one item of an object-list field (e.g. one "group" inside
// bible-connections' "groups"). Keeps the walker (formRenderer.ts) free of any UI code.
export function SchemaForm({ fields, values, onChange }: SchemaFormProps) {
  function setField(name: string, value: unknown) {
    onChange({ ...values, [name]: value });
  }

  return (
    <div className="schema-form">
      {fields.map((field) => (
        <FieldEditor
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => setField(field.name, value)}
        />
      ))}
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.kind) {
    case "const":
      return (
        <FieldRow field={field}>
          <input className="text-input" value={field.constValue ?? ""} disabled readOnly />
        </FieldRow>
      );

    case "enum":
      return (
        <FieldRow field={field}>
          <select className="text-input" value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)}>
            {(field.enumValues ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FieldRow>
      );

    case "integer":
      return (
        <FieldRow field={field}>
          <input
            className="text-input"
            type="number"
            value={typeof value === "number" ? value : 0}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        </FieldRow>
      );

    case "textarea":
      return (
        <FieldRow field={field}>
          <textarea
            className="text-area"
            rows={3}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          />
        </FieldRow>
      );

    case "nullable-text": {
      const isSet = value !== null && value !== undefined;
      return (
        <FieldRow field={field}>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={isSet}
              onChange={(event) => onChange(event.target.checked ? "" : null)}
            />
            Set a value
          </label>
          {isSet ? (
            <textarea
              className="text-area"
              rows={2}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(event.target.value)}
            />
          ) : (
            <span className="muted-note">Not set (null)</span>
          )}
        </FieldRow>
      );
    }

    case "string-list":
      return (
        <FieldRow field={field}>
          <StringListEditor
            values={Array.isArray(value) ? (value as string[]) : []}
            onChange={onChange}
            minItems={field.minItems}
            maxItems={field.maxItems}
          />
        </FieldRow>
      );

    case "object-list":
      return (
        <FieldRow field={field}>
          <ObjectListEditor
            itemFields={field.itemFields ?? []}
            values={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
            onChange={onChange}
            minItems={field.minItems}
            maxItems={field.maxItems}
          />
        </FieldRow>
      );

    case "text":
    default:
      return (
        <FieldRow field={field}>
          <input
            className="text-input"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
          />
        </FieldRow>
      );
  }
}

function FieldRow({ field, children }: { field: FieldDescriptor; children: ReactNode }) {
  return (
    <div className="field-row">
      <label>
        {field.name}
        {field.required ? <span className="required-mark">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function StringListEditor({
  values,
  onChange,
  minItems,
  maxItems
}: {
  values: string[];
  onChange: (values: string[]) => void;
  minItems?: number;
  maxItems?: number;
}) {
  const canAdd = maxItems === undefined || values.length < maxItems;
  const canRemove = minItems === undefined || values.length > minItems;

  return (
    <div className="list-editor">
      {values.map((entry, index) => (
        <div className="list-editor-row" key={index}>
          <input
            className="text-input"
            value={entry}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="ghost-button"
            disabled={!canRemove}
            onClick={() => onChange(values.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="secondary-button" disabled={!canAdd} onClick={() => onChange([...values, ""])}>
        Add item
      </button>
      {minItems !== undefined || maxItems !== undefined ? (
        <span className="muted-note">
          {minItems !== undefined ? `min ${minItems}` : ""}
          {minItems !== undefined && maxItems !== undefined ? " · " : ""}
          {maxItems !== undefined ? `max ${maxItems}` : ""}
        </span>
      ) : null}
    </div>
  );
}

function ObjectListEditor({
  itemFields,
  values,
  onChange,
  minItems,
  maxItems
}: {
  itemFields: FieldDescriptor[];
  values: Record<string, unknown>[];
  onChange: (values: Record<string, unknown>[]) => void;
  minItems?: number;
  maxItems?: number;
}) {
  const canAdd = maxItems === undefined || values.length < maxItems;
  const canRemove = minItems === undefined || values.length > minItems;

  function emptyItem(): Record<string, unknown> {
    const item: Record<string, unknown> = {};
    for (const field of itemFields) {
      item[field.name] = emptyValueForField(field);
    }
    return item;
  }

  return (
    <div className="list-editor object-list-editor">
      {values.map((item, index) => (
        <div className="object-list-item" key={index}>
          <div className="object-list-item-header">
            <span>Item {index + 1}</span>
            <button
              type="button"
              className="ghost-button"
              disabled={!canRemove}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
          <SchemaForm
            fields={itemFields}
            values={item}
            onChange={(nextItem) => {
              const next = [...values];
              next[index] = nextItem;
              onChange(next);
            }}
          />
        </div>
      ))}
      <button type="button" className="secondary-button" disabled={!canAdd} onClick={() => onChange([...values, emptyItem()])}>
        Add item
      </button>
      {minItems !== undefined || maxItems !== undefined ? (
        <span className="muted-note">
          {minItems !== undefined ? `min ${minItems}` : ""}
          {minItems !== undefined && maxItems !== undefined ? " · " : ""}
          {maxItems !== undefined ? `max ${maxItems}` : ""}
        </span>
      ) : null}
    </div>
  );
}
