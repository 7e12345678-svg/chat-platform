"use client";

import { useMemo, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";

/* ============================================================
 * TYPES
 * ============================================================ */

/**
 * Represents one conversation shown in the conversation list.
 *
 * This is temporary mock data.
 * Real data will come from the backend later.
 */
interface Conversation {
  id: string;
  name: string;
  preview?: string;
  time?: string;
  fallback: string;
  online?: boolean;
  unread?: number;
  typing?: boolean;
}

/**
 * Props received from the parent page.
 */
export interface ConversationListProps {
  selectedConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  unreadCounts: Record<string, number>;
  lastMessagePreviewByConversation: Record<string, string>;
  lastMessageTimeByConversation: Record<string, string>;
  conversations: Conversation[];
isLoading?: boolean;
}


/* ============================================================
 * MOCK DATA
 * ============================================================ */

/**
 * Temporary conversation data.
 *
 * Later:
 * API → PostgreSQL → Page State → ConversationList
 */
const conversations: Conversation[] = [
  {
    id: "sopheak",
    name: "Sopheak",
    preview: "Hello, how are you?",
    time: "2m",
    fallback: "S",
    online: true,
    unread: 2,
    typing: false,
  },
  {
    id: "dara",
    name: "Dara",
    preview: "See you tomorrow!",
    time: "5m",
    fallback: "D",
    online: true,
    typing: false,
  },
  {
    id: "vanna",
    name: "Vanna",
    preview: "Thanks for your help.",
    time: "10m",
    fallback: "V",
    typing: false,
  },
  {
    id: "development-team",
    name: "Development Team",
    preview: "The new feature is ready.",
    time: "25m",
    fallback: "D",
    unread: 5,
    typing: false,
  },
  {
    id: "family",
    name: "Family",
    preview: "Dinner at 7:00 PM.",
    time: "1h",
    fallback: "F",
    typing: false,
  },
];

/* ============================================================
 * COMPONENT
 * ============================================================ */

/**
 * ConversationList
 *
 * Displays:
 * - Search input
 * - Conversation items
 * - Active conversation
 * - Unread message count
 * - Online status
 * - Typing preview
 *
 * The selected conversation is controlled by the parent.
 */
export function ConversationList({
  conversations,
  isLoading = false,
  selectedConversationId,
  onSelectConversation,
  unreadCounts,
  lastMessagePreviewByConversation,
  lastMessageTimeByConversation,
}: ConversationListProps) {
  
  /* ==========================================================
   * SEARCH STATE
   * ========================================================== */

  const [searchQuery, setSearchQuery] = useState("");

  /* ==========================================================
   * FILTER CONVERSATIONS
   * ========================================================== */

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Empty search → show all conversations.
    if (!query) {
      return conversations;
    }

    // Search by conversation name.
    return conversations.filter((conversation) =>
      conversation.name.toLowerCase().includes(query),
    );
    }, [conversations, searchQuery]);

  // ============================================================
// SORT BY LATEST MESSAGE
// Conversation with the newest message appears first.
// ============================================================
const sortedConversations = [
  ...filteredConversations,
].sort((a, b) => {
  const timeA =
    lastMessageTimeByConversation[a.id] ??
    a.time;

  const timeB =
    lastMessageTimeByConversation[b.id] ??
    b.time;

  const timestampA = new Date(
    `1970-01-01 ${timeA}`,
  ).getTime();

  const timestampB = new Date(
    `1970-01-01 ${timeB}`,
  ).getTime();

  return timestampB - timestampA;
});

  /* ==========================================================
   * RENDER
   * ========================================================== */

  return (
    <section
      className="
        flex
        h-full
        w-full
        shrink-0
        flex-col
        border-r
        border-[var(--border)]
        bg-[var(--background)]
        md:w-80
      "
    >
      {/* ======================================================
       * HEADER
       * ====================================================== */}

      <header
        className="
          flex
          h-[var(--header-height)]
          shrink-0
          items-center
          justify-between
          border-b
          border-[var(--border)]
          px-4
        "
      >
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Messages
        </h2>

        <button
          type="button"
          aria-label="New message"
          title="New message"
          className="
            rounded-md
            p-2
            text-lg
            leading-none
            text-[var(--text-secondary)]
            transition-colors
            hover:bg-[var(--surface-hover)]
            hover:text-[var(--text-primary)]
          "
        >
          +
        </button>
      </header>

      {/* ======================================================
       * SEARCH
       * ====================================================== */}

      <div className="shrink-0 border-b border-[var(--border)] p-4">
        <label
          htmlFor="conversation-search"
          className="sr-only"
        >
          Search conversations
        </label>

        <input
          id="conversation-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search messages..."
          autoComplete="off"
          className="
            h-10
            w-full
            rounded-lg
            border
            border-[var(--border)]
            bg-[var(--surface)]
            px-3
            text-sm
            text-[var(--text-primary)]
            outline-none
            placeholder:text-[var(--text-muted)]
            focus:border-[var(--primary)]
            focus:ring-2
            focus:ring-[var(--primary)]/20
          "
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
  {isLoading ? (
    <div className="px-3 py-8 text-center">
      <p className="text-sm text-[var(--text-muted)]">
        Loading conversations...
      </p>
    </div>
  ) : filteredConversations.length === 0 ? (
          /* --------------------------------------------------
           * EMPTY SEARCH STATE
           * -------------------------------------------------- */

          <div className="px-3 py-8 text-center">
            <div className="text-2xl">⌕</div>

            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
              No conversations found
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Try searching with another name.
            </p>
          </div>
        ) : (
          /* --------------------------------------------------
           * CONVERSATION ITEMS
           * -------------------------------------------------- */
          

          <div className="space-y-1">
            {sortedConversations.map((conversation) => {
              

              const unreadCount = unreadCounts[conversation.id] ?? 0;
              const lastMessagePreview =
  lastMessagePreviewByConversation[conversation.id] ??
  conversation.preview;

  const lastMessageTime =
  lastMessageTimeByConversation[conversation.id] ??
  conversation.time;

              
              /* ----------------------------------------------
               * ACTIVE STATE
               * ---------------------------------------------- */

              const isSelected =
                conversation.id === selectedConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    onSelectConversation(conversation.id)
                  }
                  className={[
                    "flex w-full items-center gap-3 rounded-lg p-2.5 text-left",
                    "transition-colors duration-150",
                    isSelected
                      ? "bg-[var(--surface-active)] shadow-sm"
                      : "hover:bg-[var(--surface-hover)]",
                  ].join(" ")}
                >
                  {/* ==========================================
                   * AVATAR
                   * ========================================== */}

                  <Avatar
                    fallback={conversation.fallback}
                    size="md"
                    online={conversation.online}
                  />

                  {/* ==========================================
                   * CONVERSATION CONTENT
                   * ========================================== */}

                  <div className="min-w-0 flex-1">
                    {/* ----------------------------------------
                     * NAME + TIME
                     * ---------------------------------------- */}

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={[
                          "truncate text-sm",
                          isSelected
                            ? "font-semibold text-[var(--text-primary)]"
                            : "font-medium text-[var(--text-primary)]",
                        ].join(" ")}
                      >
                        {conversation.name}
                      </p>

                      {/* --------------------------------------
                       * TIMESTAMP
                       * -------------------------------------- */}

                      <span
                        className={[
                          "shrink-0 text-[10px]",
                          conversation.unread &&
                          conversation.unread > 0
                            ? "font-medium text-[var(--primary)]"
                            : "text-[var(--text-muted)]",
                        ].join(" ")}
                      >
                        {lastMessageTime}
                      </span>
                    </div>

                    {/* ----------------------------------------
                     * PREVIEW + UNREAD
                     * ---------------------------------------- */}

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p
                        className={[
                          "truncate text-xs",
                          conversation.typing
                            ? "font-medium text-[var(--primary)]"
                            : conversation.unread &&
                                conversation.unread > 0
                              ? "font-medium text-[var(--text-primary)]"
                              : "text-[var(--text-secondary)]",
                        ].join(" ")}
                      >
                        {conversation.typing
                        ? "typing..."
                        : lastMessagePreview}
                      </p>

                      {/* ======================================
                       * UNREAD COUNT
                       * ====================================== */}

              {unreadCount > 0 && (
  <span
    className="
      flex
      h-5
      min-w-5
      shrink-0
      items-center
      justify-center
      rounded-full
      bg-[var(--primary)]
      px-1.5
      text-[10px]
      font-semibold
      text-white
    "
  >
    {unreadCount > 99 ? "99+" : unreadCount}
  </span>
)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}