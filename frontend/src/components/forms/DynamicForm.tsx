import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FormFieldType, type FormField, type DynamicFormProps } from "./types";

export default function DynamicForm({
  fields,
  initialValues,
  onSubmit,
  submitText = "Submit",
  className = "",
}: DynamicFormProps) {
  // Generate validation schema from fields
  const validationSchema = Yup.object().shape(
    fields.reduce(
      (schema, field) => {
        if (field.validation) {
          schema[field.name] = field.validation;
        } else if (field.required) {
          schema[field.name] = Yup.string().required(
            `${field.label} is required`,
          );
        }
        return schema;
      },
      {} as Record<string, Yup.StringSchema | Yup.NumberSchema | Yup.BooleanSchema>,
    ),
  );

  const renderField = (field: FormField) => {
    const baseClasses =
      "w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    switch (field.type) {
      case FormFieldType.Textarea:
        return (
          <Field
            as="textarea"
            name={field.name}
            placeholder={field.placeholder}
            className={`${baseClasses} resize-vertical h-24`}
          />
        );

      case FormFieldType.Select:
        return (
          <Field as="select" name={field.name} className={baseClasses}>
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Field>
        );

      case FormFieldType.Checkbox:
        return (
          <Field
            type="checkbox"
            name={field.name}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        );

      default:
        return (
          <Field
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className={`space-y-4 ${className}`}>
          {fields.map((field) => (
            <div key={field.name} className="space-y-1">
              {field.type === FormFieldType.Checkbox ? (
                <div className="flex items-center space-x-2">
                  {renderField(field)}
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-white"
                  >
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                  </label>
                </div>
              ) : (
                <>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-white"
                  >
                    {field.label}
                    {field.required && <span className="ml-1 text-red-500">*</span>}
                  </label>
                  {renderField(field)}
                </>
              )}
              <ErrorMessage
                name={field.name}
                component="div"
                className="text-sm text-red-500"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200"
          >
            {isSubmitting ? "Submitting..." : submitText}
          </button>
        </Form>
      )}
    </Formik>
  );
}
