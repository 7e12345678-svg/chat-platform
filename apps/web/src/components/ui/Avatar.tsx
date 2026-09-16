import Image from "next/image";

/* ============================================================
   AVATAR TYPES
   ============================================================ */

type AvatarSize =
  | "sm"
  | "md"
  | "lg"
  | "xl";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}


/* ============================================================
   AVATAR COMPONENT
   ============================================================ */

/**
 * Reusable Avatar component.
 *
 * Supports:
 * - Profile image
 * - Fallback initials
 * - Multiple sizes
 * - Online status
 * - Custom className
 */
export function Avatar({
  src,
  alt = "User avatar",
  fallback = "?",
  size = "md",
  online = false,
  className = "",
}: AvatarProps) {
  /* ==========================================================
     SIZE STYLES
     ========================================================== */

  const sizeStyles: Record<
    AvatarSize,
    string
  > = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-xl",
  };


  /* ==========================================================
     STATUS DOT SIZE
     ========================================================== */

  const statusSizeStyles: Record<
    AvatarSize,
    string
  > = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
    xl: "h-4 w-4",
  };


  /* ==========================================================
     FALLBACK TEXT
     ========================================================== */

  const fallbackText =
    fallback.trim().charAt(0).toUpperCase() || "?";


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      className={[
        "relative inline-flex shrink-0",
        "transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-[var(--primary)]/20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "relative overflow-hidden rounded-full",
          "bg-[var(--secondary)]",
          "text-[var(--text-primary)]",
          "flex items-center justify-center",
          "font-medium",
          "transition-transform duration-200",
          sizeStyles[size],
        ].join(" ")}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="64px"
            className="object-cover transition-transform duration-200"
          />
        ) : (
          <span aria-hidden="true"
          className="select-none transition-transform duration-200"
          >
            {fallbackText}
          </span>
        )}
      </div>

      {online && (
        <span
          aria-label="Online"
          className={[
            "absolute bottom-0 right-0",
            "rounded-full",
            "border-2 border-[var(--background)]",
            "bg-[var(--success)]",
            "transition-transform duration-200 hover:scale-[1.02]",
            "scale-100 shadow-sm hover:scale-110",
            statusSizeStyles[size],
          ].join(" ")}
        />
      )}
    </div>
  );
}