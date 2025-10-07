import DynamicForm from "./DynamicForm";
import { type FormField, FormFieldType } from "./types";
import * as Yup from "yup";

// Example: User registration form
const userFields: FormField[] = [
  {
    name: "name",
    label: "Full Name",
    type: FormFieldType.Text,
    placeholder: "Enter your full name",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: FormFieldType.Email,
    placeholder: "Enter your email",
    required: true,
    validation: Yup.string()
      .email("Invalid email")
      .required("Email is required"),
  },
  {
    name: "age",
    label: "Age",
    type: FormFieldType.Number,
    placeholder: "Enter your age",
    validation: Yup.number()
      .min(18, "Must be at least 18")
      .required("Age is required"),
  },
  {
    name: "bio",
    label: "Bio",
    type: FormFieldType.Textarea,
    placeholder: "Tell us about yourself",
  },
  {
    name: "role",
    label: "Role",
    type: FormFieldType.Select,
    required: true,
    options: [
      { value: "user", label: "User" },
      { value: "admin", label: "Admin" },
      { value: "moderator", label: "Moderator" },
    ],
  },
  {
    name: "newsletter",
    label: "Subscribe to newsletter",
    type: FormFieldType.Checkbox,
  },
  {
    name: "terms",
    label: "I agree to the terms and conditions",
    type: FormFieldType.Checkbox,
    required: true,
    validation: Yup.boolean().oneOf([true], "You must accept the terms"),
  },
];

export default function ExampleUsage() {
  const handleSubmit = async (
    values: Record<string, string | number | boolean>,
  ) => {
    console.log("Form submitted:", values);

    // Example: Save to database
    // await saveUserToDatabase(values);

    // Example: Call API
    // await fetch('/api/users', {
    //   method: 'POST',
    //   body: JSON.stringify(values),
    // });
  };

  return (
    <div className="mx-auto max-w-md">
      <h2 className="mb-4 text-2xl font-bold">User Registration</h2>
      <DynamicForm
        fields={userFields}
        initialValues={{
          name: "",
          email: "",
          age: "",
          bio: "",
          role: "",
          newsletter: false,
          terms: false,
        }}
        onSubmit={handleSubmit}
        submitText="Register"
        className="rounded-lg p-6"
      />
    </div>
  );
}
