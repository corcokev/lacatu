import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({
  variant = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    default:
      "bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
