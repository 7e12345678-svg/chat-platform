import type { InputHTMLAttributes } from "react";

/* ============================================================
   INPUT PROPS
   ============================================================ */

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}


/* ============================================================
   INPUT COMPONENT
   ============================================================ */

/**
 * Reusable Input component.
 *
 * Supports:
 * - Optional label
 * - Error message
 * - Native input attributes
 * - Disabled state
 * - Custom className
 */
export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  /* ==========================================================
     INPUT STYLES
     ========================================================== */

  const inputClassName = [
    "w-full rounded-lg border px-3 py-2.5",
    "bg-[var(--surface)]",
    "border-[var(--border)]",
    "text-[var(--text-primary)]",
    "placeholder:text-[var(--text-muted)]",
    "transition-colors duration-200",
    "outline-none",
    "focus:border-[var(--primary)]",
    "focus:ring-2",
    "focus:ring-[var(--primary)]/20",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    error
      ? "border-[var(--danger)] focus:border-[var(--danger)]"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={inputClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}