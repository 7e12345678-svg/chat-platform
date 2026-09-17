"use client";

import { useRouter } from "next/navigation";

import { Avatar } from "@/components/ui/Avatar";

/* ============================================================
   SIDEBAR
   ============================================================ */

/**
 * Sidebar
 *
 * Main navigation area of the Chat Platform.
 *
 * Responsibilities:
 * - Application branding
 * - Main navigation
 * - Server/community navigation
 * - Current user area
 *
 * This component currently uses static UI data.
 * Real user/server data will be connected later.
 */

  export function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      return;
    }

    router.push("/auth/login");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* ======================================================
         BRAND
         ====================================================== */}

      <div className="flex h-[var(--header-height)] shrink-0 items-center border-b border-[var(--border)] px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)] font-bold text-white">
            C
          </div>

          <div>
            <p className="text-sm font-semibold">
              Chat Platform
            </p>

            <p className="text-xs text-[var(--text-muted)]">
              Communication
            </p>
          </div>
        </div>
      </div>


      {/* ======================================================
         NAVIGATION
         ====================================================== */}

      <nav className="space-y-1 p-3">

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg bg-[var(--surface-active)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)]"
        >
          <span aria-hidden="true">💬</span>
          Messages
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          <span aria-hidden="true">👥</span>
          Friends
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        >
          <span aria-hidden="true">🔔</span>
          Notifications
        </button>

      </nav>


      {/* ======================================================
         SERVERS
         ====================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto px-3">

        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Servers
          </p>

          <button
            type="button"
            aria-label="Add server"
            className="rounded-md px-1.5 py-1 text-lg leading-none text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            +
          </button>
        </div>


        {/* Server 1 */}

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--surface-hover)]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-sm font-semibold">
            A
          </div>

          <span className="truncate text-sm text-[var(--text-secondary)]">
            Angkor Community
          </span>
        </button>


        {/* Server 2 */}

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--surface-hover)]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-sm font-semibold">
            D
          </div>

          <span className="truncate text-sm text-[var(--text-secondary)]">
            Developers
          </span>
        </button>


        {/* Server 3 */}

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--surface-hover)]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)] text-sm font-semibold">
            G
          </div>

          <span className="truncate text-sm text-[var(--text-secondary)]">
            Gaming
          </span>
        </button>

      </div>


      {/* ======================================================
         CURRENT USER
         ====================================================== */}

      <div className="shrink-0 border-t border-[var(--border)] p-3">

        <div className="flex items-center gap-3 rounded-lg p-2">

          <Avatar
            fallback="H"
            size="md"
            online
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              User
            </p>

            <p className="text-xs text-[var(--success)]">
              Online
            </p>
          </div>

          <button
  type="button"
  aria-label="Logout"
  onClick={handleLogout}
  className="rounded-md p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
>
  ⇥
</button>

          <button
            type="button"
            aria-label="User settings"
            className="rounded-md p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            ⚙
          </button>

        </div>

      </div>

    </div>
  );
}