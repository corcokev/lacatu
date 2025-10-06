import { type InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const baseClasses =
    "flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return <input className={`${baseClasses} ${className}`} {...props} />;
}
