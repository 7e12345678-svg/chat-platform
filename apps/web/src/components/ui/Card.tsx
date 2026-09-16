import type { HTMLAttributes } from "react";

/* ============================================================
   CARD PROPS
   ============================================================ */

export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive";
}


/* ============================================================
   CARD COMPONENT
   ============================================================ */

/**
 * Reusable Card container.
 *
 * Supports:
 * - Default card
 * - Interactive/hoverable card
 * - Native div attributes
 * - Custom className
 */
export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  /* ==========================================================
     BASE STYLES
     ========================================================== */

  const baseStyles = [
    "rounded-xl",
    "border",
    "border-[var(--border)]",
    "bg-[var(--surface)]",
    "text-[var(--text-primary)]",
    "shadow-[var(--shadow-sm)]",
  ];


  /* ==========================================================
     VARIANT STYLES
     ========================================================== */

  const variantStyles: Record<
  NonNullable<CardProps["variant"]>,
  string
> = {
    default: "",

    interactive:
      "cursor-pointer transition-colors duration-200 hover:bg-[var(--surface-hover)]",
  };


  /* ==========================================================
     FINAL CLASS NAME
     ========================================================== */

  const cardClassName = [
    ...baseStyles,
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      className={cardClassName}
      {...props}
    >
      {children}
    </div>
  );
}