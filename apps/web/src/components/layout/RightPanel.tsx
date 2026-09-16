import { Avatar } from "@/components/ui/Avatar";
import type { UserPresence } from "@/components/layout/ChatArea";

/* ============================================================
   RIGHT PANEL
   ============================================================ */

/**
 * RightPanel
 *
 * Displays additional information about the active conversation.
 *
 * Current UI sections:
 * - Profile
 * - Conversation actions
 * - Shared media
 * - Members
 *
 * Real data will be connected later.
 */
export function RightPanel({
  conversationName,
  presence,
  lastSeenText,
  onPresenceChange,
}: {
  conversationName: string;
  presence?: UserPresence;
  lastSeenText?: string;
  onPresenceChange?: (
    status: UserPresence["status"],
    lastSeen?: string,
  ) => void;
}) {

  // ============================================================
  // CONVERSATION AVATAR
  // Uses the first letter of the active conversation name.
  // ============================================================
  const conversationInitial =
    conversationName.charAt(0).toUpperCase();

  return (
    <div className="flex h-full min-h-0 flex-col">

      {/* ======================================================
         HEADER
         ====================================================== */}

      <header className="flex h-[var(--header-height)] shrink-0 items-center border-b border-[var(--border)] px-4">
        <h2 className="text-sm font-semibold">
          Conversation Info
        </h2>
      </header>


      {/* ======================================================
         CONTENT
         ====================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto">

        {/* ====================================================
           PROFILE
           ==================================================== */}

        <section className="flex flex-col items-center border-b border-[var(--border)] px-4 py-6">

          <Avatar
  fallback={conversationInitial}
  size="xl"
  online={presence?.status === "online"}
/>

          <h3 className="mt-3 text-base font-semibold">
            {conversationName}
          </h3>

            <p
  className={
    presence?.status === "online"
      ? "mt-1 text-xs text-[var(--success)]"
      : "mt-1 text-xs text-[var(--text-muted)]"
  }
>
  {presence?.status === "online"
  ? "Online"
  : lastSeenText ?? "Offline"}
</p>

{/* ============================================================
   PRESENCE TEST CONTROLS
   Temporary controls for testing Online / Offline / Last Seen.
   Later these will be replaced by realtime presence data.
   ============================================================ */}
<div className="mt-4 flex flex-wrap justify-center gap-2">
  <button
    type="button"
    onClick={() => onPresenceChange?.("online")}
    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
  >
    🟢 Online
  </button>

  <button
    type="button"
    onClick={() => onPresenceChange?.("offline")}
    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
  >
    ⚪ Offline
  </button>

  <button
    type="button"
    onClick={() =>
      onPresenceChange?.("offline", "5 minutes ago")
    }
    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
  >
    🕐 Last seen
  </button>
</div>

        </section>


        {/* ====================================================
           ACTIONS
           ==================================================== */}

        <section className="border-b border-[var(--border)] p-4">

          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Actions
          </h3>

          <div className="space-y-1">

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <span aria-hidden="true">🔍</span>
              Search in conversation
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <span aria-hidden="true">🔔</span>
              Notifications
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <span aria-hidden="true">📎</span>
              Shared media
            </button>

          </div>

        </section>


        {/* ====================================================
           MEMBERS
           ==================================================== */}

        <section className="p-4">

          <div className="mb-3 flex items-center justify-between">

            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Members
            </h3>

            <span className="text-xs text-[var(--text-muted)]">
              2
            </span>

          </div>


          <div className="space-y-1">

            <div className="flex items-center gap-3 rounded-lg p-2">
              <Avatar
                fallback={conversationInitial}
                size="sm"
                online={presence?.status === "online"}
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {conversationName}
                </p>

                  <p
  className={
    presence?.status === "online"
      ? "text-xs text-[var(--success)]"
      : "text-xs text-[var(--text-muted)]"
  }
>
  {presence?.status === "online"
    ? "Online"
    : presence?.lastSeen
      ? `Last seen ${presence.lastSeen}`
      : "Offline"}
</p>
              </div>
            </div>


            <div className="flex items-center gap-3 rounded-lg p-2">
              <Avatar
                fallback="Y"
                size="sm"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  You
                </p>

                <p className="text-xs text-[var(--text-muted)]">
                  Offline
                </p>
              </div>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}