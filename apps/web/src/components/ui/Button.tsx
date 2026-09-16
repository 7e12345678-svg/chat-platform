import type { ButtonHTMLAttributes } from "react";

/* ============================================================
   BUTTON TYPES
   ============================================================ */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger";

type ButtonSize =
  | "sm"
  | "md"
  | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}


/* ============================================================
   BUTTON COMPONENT
   ============================================================ */

/**
 * Reusable Button component.
 *
 * Supports:
 * - Multiple visual variants
 * - Multiple sizes
 * - Native button attributes
 * - Disabled state
 * - Custom className
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  /* ==========================================================
     BASE STYLES
     ========================================================== */

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:pointer-events-none disabled:opacity-50";


  /* ==========================================================
     VARIANT STYLES
     ========================================================== */

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",

    secondary:
      "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]",

    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",

    danger:
      "bg-[var(--danger)] text-white hover:opacity-90",
  };


  /* ==========================================================
     SIZE STYLES
     ========================================================== */

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };


  /* ==========================================================
     FINAL CLASS NAME
     ========================================================== */

  const buttonClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <button
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
}