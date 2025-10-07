import * as Yup from "yup";

export enum FormFieldType {
  Text = "text",
  Email = "email",
  Password = "password",
  Number = "number",
  Textarea = "textarea",
  Select = "select",
  Checkbox = "checkbox"
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // For select fields
  validation?: Yup.StringSchema | Yup.NumberSchema | Yup.BooleanSchema;
}

export interface DynamicFormProps {
  fields: FormField[];
  initialValues: Record<string, string | number | boolean>;
  onSubmit: (
    values: Record<string, string | number | boolean>,
  ) => Promise<void> | void;
  submitText?: string;
  className?: string;
}