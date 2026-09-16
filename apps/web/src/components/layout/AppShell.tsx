import type { ReactNode } from "react";

/* ============================================================
   APP SHELL PROPS
   ============================================================ */

export interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  rightPanel?: ReactNode;
}


/* ============================================================
   APP SHELL COMPONENT
   ============================================================ */

/**
 * AppShell
 *
 * Main application layout for the Chat Platform.
 *
 * Structure:
 *
 * ┌──────────────┬──────────────────────┬──────────────┐
 * │   Sidebar    │     Main Content     │  Right Panel │
 * │              │                      │              │
 * └──────────────┴──────────────────────┴──────────────┘
 *
 * Responsibilities:
 * - Defines the main application viewport
 * - Provides the sidebar area
 * - Provides the main content area
 * - Optionally provides a right-side panel
 *
 * No business logic should live here.
 */
export function AppShell({
  sidebar,
  children,
  rightPanel,
}: AppShellProps) {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[var(--background)] text-[var(--text-primary)]">

      {/* ======================================================
         SIDEBAR
         ====================================================== */}

      <aside
        className="
          flex
          h-full
          hidden md:flex md:w-[var(--sidebar-width)]
          shrink-0
          flex-col
          border-r
          border-[var(--border)]
          bg-[var(--surface)]
        "
      >
        {sidebar}
      </aside>


      {/* ======================================================
         MAIN CONTENT
         ====================================================== */}

      <main className="flex min-w-0 flex-1 flex-col">
        {children}
      </main>


      {/* ======================================================
         RIGHT PANEL
         ====================================================== */}

      {rightPanel && (
        <aside
          className="
            hidden
            h-full
            w-full md:w-80
            shrink-0
            border-l
            border-[var(--border)]
            bg-[var(--surface)]
            lg:flex
            lg:flex-col
          "
        >
          {rightPanel}
        </aside>
      )}

    </div>
  );
}