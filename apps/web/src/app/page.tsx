"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatArea } from "@/components/layout/ChatArea";
import { ConversationList } from "@/components/layout/ConversationList";
import { RightPanel } from "@/components/layout/RightPanel";
import { Sidebar } from "@/components/layout/Sidebar";

import type {
  Message,
  UserPresence,
} from "@/components/layout/ChatArea";

import { subscribeToMessages } from "@/lib/chat/realtime";
import {
  broadcastTyping,
  subscribeToTyping,
} from "@/lib/chat/typing";

import {
  mapRealtimeMessage,
  upsertMessage,
} from "@/lib/chat/messages";

import {
  getUnreadIncomingMessageIds,
} from "@/lib/chat/read-status";

import {
  getCurrentUserId,
  subscribeToPresence,
} from "@/lib/chat/presence";

import {
  getCurrentUserPresence,
  getRemotePresence,
} from "@/lib/chat/presence-state";

import {
  getUndeliveredIncomingMessageIds,
  markMessagesAsDelivered,
} from "@/lib/chat/delivery-status";


/* ============================================================
 * TYPES
 * ============================================================ */

type ConversationId = string;

interface Conversation {
  id: string;
  name: string;
  fallback: string;
  online: boolean;
  created_at?: string;
  updated_at?: string;
}

/* ============================================================
 * LAST SEEN
 * ============================================================ */

/**
 * Convert last-seen timestamp into readable Khmer text.
 */
const formatLastSeen = (lastSeenAt?: number) => {
  if (!lastSeenAt) {
    return "ក្រៅបណ្តាញ";
  }

  const difference = Date.now() - lastSeenAt;

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return "បានឃើញទើបតែឥឡូវនេះ";
  }

  if (minutes < 60) {
    return `បានឃើញ ${minutes} នាទីមុន`;
  }

  if (hours < 24) {
    return `បានឃើញ ${hours} ម៉ោងមុន`;
  }

  return "បានឃើញលើសពីមួយថ្ងៃមុន";
};

const LAST_SEEN_REFRESH_INTERVAL = 60 * 1000;

/* ============================================================
 * HOME PAGE
 * ============================================================ */

export default function Home() {
  /* ==========================================================
   * LAST SEEN REFRESH
   * ========================================================== */

  const [, setLastSeenRefresh] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastSeenRefresh((current) => current + 1);
    }, LAST_SEEN_REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  /* ==========================================================
   * SELECTED CONVERSATION
   * ========================================================== */

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<ConversationId>("sopheak");

  /* ==========================================================
   * MOBILE CHAT NAVIGATION
   * ========================================================== */

  const [
    showMobileChat,
    setShowMobileChat,
  ] = useState(false);

  /* ==========================================================
   * MESSAGE STATE
   * ========================================================== */

  /**
   * Messages are loaded from backend API.
   *
   * Start empty instead of using mock messages.
   */
  const [
    messagesByConversation,
    setMessagesByConversation,
  ] = useState<Record<
    ConversationId,
    Message[]
  >>({});

      /* ==========================================================
   * REALTIME MESSAGES
   *
   * Subscribe to new messages for the selected conversation.
   *
   * IMPORTANT:
   * - Prevent async setup from creating a channel after cleanup.
   * - Always cleanup the exact channel created by this effect.
   * ========================================================== */

  useEffect(() => {
  let cancelled = false;
  let cleanupRealtime: (() => void) | null = null;

  const setupRealtimeMessages = async () => {
    const userId = await getCurrentUserId();

    // The effect was already cleaned up.
    if (!userId || cancelled) {
      return;
    }

    const conversationId = selectedConversationId;

    const channel = subscribeToMessages(
      conversationId,
      (realtimeMessage) => {
        // Ignore events after cleanup.
        if (cancelled) {
          return;
        }

        const rawMessage = realtimeMessage as {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          status:
            | "sent"
            | "delivered"
            | "read";
          created_at: string;
        };

        const message = mapRealtimeMessage(
          rawMessage,
          userId,
        );

        /**
         * Mark incoming message as delivered.
         */
        const undeliveredMessageIds =
  getUndeliveredIncomingMessageIds([
    message,
  ]);

if (undeliveredMessageIds.length > 0) {
  void markMessagesAsDelivered(
    conversationId,
    undeliveredMessageIds,
  ).catch((error) => {
    console.error(
      "Failed to mark message as delivered:",
      error,
    );
  });
}

        /**
         * Add/update message in UI.
         */
        setMessagesByConversation(
          (currentMessages) => ({
            ...currentMessages,
            [conversationId]: upsertMessage(
              currentMessages[conversationId] ?? [],
              message,
            ),
          }),
        );
      },
    );

    /**
     * If cleanup happened while the async
     * setup was running, immediately unsubscribe.
     */
    if (cancelled) {
      channel.unsubscribe();
      return;
    }

    cleanupRealtime = () => {
      channel.unsubscribe();
    };
  };

  void setupRealtimeMessages();

  return () => {
    cancelled = true;

    cleanupRealtime?.();
    cleanupRealtime = null;
  };
}, [selectedConversationId]);

  /* ==========================================================
   * CONVERSATIONS STATE
   * ========================================================== */

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    isLoadingConversations,
    setIsLoadingConversations,
  ] = useState(true);

  /* ==========================================================
   * USER PRESENCE
   * ========================================================== */

  const [
    presenceByConversation,
    setPresenceByConversation,
  ] = useState<
    Record<ConversationId, UserPresence>
  >({
    sopheak: {
      status: "online",
    },

    dara: {
      status: "online",
    },

    vanna: {
      status: "offline",
      lastSeen: "5 minutes ago",
    },

    "development-team": {
      status: "online",
    },

    family: {
      status: "offline",
      lastSeen: "1 hour ago",
    },
  });
  const [currentUserPresence, setCurrentUserPresence] =
  useState<UserPresence>({
    status: "offline",
  });

  /* ==========================================================
   * UNREAD COUNTS
   * ========================================================== */

  const [
    unreadCounts,
    setUnreadCounts,
  ] = useState<Record<string, number>>({
    sopheak: 2,
    "development-team": 5,
  });

  /* ==========================================================
   * TYPING STATE
   * ========================================================== */

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  const typingChannelRef = useRef<
  ReturnType<typeof subscribeToTyping> | null
>(null);
const currentUserIdRef = useRef<string | null>(null);

  /* ==========================================================
   * LOAD MESSAGES
   *
   * GET /api/conversations/:conversationId/messages
   * ========================================================== */

  const loadMessages = async (
  conversationId: ConversationId,
): Promise<Message[] | null> => {
  try {
    const response = await fetch(
      `/api/conversations/${conversationId}/messages`,
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => null);

      throw new Error(
        errorData?.message ||
          "Failed to load messages",
      );
    }

    const result = await response.json();

    const apiMessages =
      result.data as Message[];

    setMessagesByConversation(
      (currentMessages) => ({
        ...currentMessages,
        [conversationId]: apiMessages,
      }),
    );

    return apiMessages;
  } catch (error) {
    console.error(
      "Failed to load messages:",
      error,
    );

    return null;
  }
};

  /* ==========================================================
 * LOAD CONVERSATIONS
 *
 * GET /api/conversations
 * ========================================================== */

const loadConversations = async () => {
  try {
    setIsLoadingConversations(true);

    const response = await fetch(
      "/api/conversations",
    );

    if (!response.ok) {
      const errorData =
        await response
          .json()
          .catch(() => null);

      throw new Error(
        errorData?.message ||
          "Failed to load conversations",
      );
    }

    const result =
      await response.json();

    const apiConversations =
      result.data as Conversation[];

    setConversations(
      apiConversations,
    );

    /* --------------------------------------------------------
     * SELECT CONVERSATION
     * -------------------------------------------------------- */

    const selectedStillExists =
      apiConversations.some(
        (conversation) =>
          conversation.id ===
          selectedConversationId,
      );

    const nextConversationId =
      selectedStillExists
        ? selectedConversationId
        : apiConversations[0]?.id;

    if (!nextConversationId) {
      return;
    }

    setSelectedConversationId(
      nextConversationId,
    );

    /* --------------------------------------------------------
     * LOAD INITIAL MESSAGES
     * -------------------------------------------------------- */

    await loadMessages(
      nextConversationId,
    );
  } catch (error) {
    console.error(
      "Failed to load conversations:",
      error,
    );
  } finally {
    setIsLoadingConversations(
      false,
    );
  }
};

  /* ==========================================================
   * INITIAL DATA LOAD
   * ========================================================== */

  useEffect(() => {
    void loadConversations();
    // We intentionally load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

      /* ==========================================================
   * REALTIME PRESENCE
   *
   * Track the current authenticated user and listen for
   * other users joining/leaving the selected conversation.
   * ========================================================== */

  useEffect(() => {
    let channel: ReturnType<
      typeof subscribeToPresence
    > | null = null;

    const setupPresence = async () => {
      const userId = await getCurrentUserId();

      if (!userId) {
        return;
      }

      channel = subscribeToPresence(
        selectedConversationId,
        userId,
        (presenceState) => {
          const typedPresenceState =
            presenceState as Record<
              string,
              {
                userId?: string;
                onlineAt?: string;
              }[]
            >;

          const currentPresence =
            getCurrentUserPresence(
              typedPresenceState,
              userId,
            );

          const remotePresence =
            getRemotePresence(
              typedPresenceState,
              userId,
            );

          setCurrentUserPresence(currentPresence);

          setPresenceByConversation(
            (currentPresenceByConversation) => ({
              ...currentPresenceByConversation,
              [selectedConversationId]:
                remotePresence,
            }),
          );
        },
      );
    };

    void setupPresence();

    return () => {
      channel?.unsubscribe();
    };
  }, [selectedConversationId]);

  /* ==========================================================
   * REALTIME TYPING
   *
   * Listen for typing events from other users.
   * ========================================================== */

  useEffect(() => {
    const setupTyping = async () => {
      const userId = await getCurrentUserId();

      if (!userId) {
        return;
      }

      currentUserIdRef.current = userId;

      typingChannelRef.current =
        subscribeToTyping(
          selectedConversationId,
          userId,
          (remoteIsTyping) => {
            setIsTyping(remoteIsTyping);
          },
        );
    };

    void setupTyping();

    return () => {
      typingChannelRef.current?.unsubscribe();
      typingChannelRef.current = null;
      currentUserIdRef.current = null;
    };
  }, [selectedConversationId]);

    const handleTypingChange = async (typing: boolean) => {
    setIsTyping(typing);

    const channel = typingChannelRef.current;
    const userId = currentUserIdRef.current;

    if (!channel || !userId) {
      return;
    }

    await broadcastTyping(
      channel,
      userId,
      typing,
    );
  };

  /* ==========================================================
   * SELECT CONVERSATION
   *
   * Load messages every time a conversation is selected.
   * ========================================================== */

  const handleSelectConversation = async (
    conversationId: ConversationId,
  ) => {
    /* ----------------------------------------------------------
     * 1. Set active conversation
     * ---------------------------------------------------------- */

    setSelectedConversationId(
      conversationId,
    );

    /* ----------------------------------------------------------
     * 2. Load messages from backend
     * ---------------------------------------------------------- */

    const loadedMessages =
  await loadMessages(
    conversationId,
  );

if (loadedMessages) {
  await markConversationAsRead(
    conversationId,
    loadedMessages,
  );
}

    /* ----------------------------------------------------------
     * 4. Reset unread count
     * ---------------------------------------------------------- */

    setUnreadCounts(
      (currentCounts) => ({
        ...currentCounts,

        [conversationId]: 0,
      }),
    );

    /* ----------------------------------------------------------
     * 5. Open mobile chat
     * ---------------------------------------------------------- */

    setShowMobileChat(true);

    /* ----------------------------------------------------------
     * 6. Stop typing
     * ---------------------------------------------------------- */

    setIsTyping(false);
  };

  /* ==========================================================
   * MOBILE BACK
   * ========================================================== */

  const handleMobileBack = () => {
    setShowMobileChat(false);
    setIsTyping(false);
  };

  /* ==========================================================
 * MARK CONVERSATION AS READ
 * ========================================================== */

const markConversationAsRead = async (
  conversationId: ConversationId,
  messages: Message[],
) => {
  const messageIds =
    getUnreadIncomingMessageIds(messages);

  if (messageIds.length === 0) {
    return;
  }

  try {
    const response = await fetch(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageIds,
        }),
      },
    );

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      throw new Error(
        errorData?.message ||
          "Failed to mark messages as read",
      );
    }

    const result = await response.json();

    const updatedMessages =
      result.data as {
        id: string;
        status: "read";
      }[];

    setMessagesByConversation(
      (currentMessages) => ({
        ...currentMessages,

        [conversationId]: (
          currentMessages[conversationId] ?? []
        ).map((message) => {
          const wasMarkedRead =
            updatedMessages.some(
              (item) => item.id === message.id,
            );

          return wasMarkedRead
            ? {
                ...message,
                status: "read",
              }
            : message;
        }),
      }),
    );
  } catch (error) {
    console.error(
      "Failed to mark messages as read:",
      error,
    );
  }
};

  /* ==========================================================
 * AUTO MARK READ
 *
 * Mark incoming unread messages as read whenever the
 * currently selected conversation has messages loaded.
 * This also handles the default selected conversation
 * after login.
 * ========================================================== */

useEffect(() => {
  const messages =
    messagesByConversation[
      selectedConversationId
    ];

  if (!messages || messages.length === 0) {
    return;
  }

  void markConversationAsRead(
    selectedConversationId,
    messages,
  );
}, [
  selectedConversationId,
  messagesByConversation,
]);

  /* ==========================================================
   * SEND MESSAGE
   *
   * POST /api/conversations/:conversationId/messages
   * ========================================================== */

  const handleSendMessage = async (
    text: string,
    replyTo?: Message["replyTo"],
  ) => {
    const trimmedText = text.trim();

    /* ----------------------------------------------------------
     * 1. Validate
     * ---------------------------------------------------------- */

    if (!trimmedText) {
      return;
    }

    try {
      /* --------------------------------------------------------
       * 2. POST message to backend
       * -------------------------------------------------------- */

      const response = await fetch(
        `/api/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: trimmedText,
          }),
        },
      );

      /* --------------------------------------------------------
       * 3. Handle API error
       * -------------------------------------------------------- */

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
            "Failed to send message",
        );
      }

      /* --------------------------------------------------------
       * 4. Read saved message
       * -------------------------------------------------------- */

      const result =
        await response.json();

      const apiMessage =
        result.data as Message;

      /* --------------------------------------------------------
       * 5. Keep reply reference
       * -------------------------------------------------------- */

      const newMessage: Message = {
        ...apiMessage,

        ...(replyTo
          ? {
              replyTo,
            }
          : {}),
      };

      /* --------------------------------------------------------
       * 6. Add saved message to UI
       * -------------------------------------------------------- */

      setMessagesByConversation(
        (currentMessages) => {
          const currentConversationMessages =
            currentMessages[
              selectedConversationId
            ] ?? [];

          return {
            ...currentMessages,

            [selectedConversationId]: [
              ...currentConversationMessages,
              newMessage,
            ],
          };
        },
      );

    } catch (error) {
      console.error(
        "Failed to send message:",
        error,
      );
    }
  };

  /* ==========================================================
   * EDIT MESSAGE
   *
   * UI-only for now.
   * Backend PATCH for messages can be added later.
   * ========================================================== */

    /* ==========================================================
   * EDIT MESSAGE
   *
   * PATCH /api/conversations/:conversationId/messages
   *
   * Only the message owner can edit the message.
   * Backend validates ownership using the authenticated user.
   * ========================================================== */

  const handleEditMessage = async (
    messageId: string,
    text: string,
  ) => {
    const trimmedText = text.trim();

    /**
     * ----------------------------------------------------------
     * 1. Validate edited text
     * ----------------------------------------------------------
     */
    if (!trimmedText) {
      return;
    }

    try {
      /**
       * --------------------------------------------------------
       * 2. Update message in backend
       * --------------------------------------------------------
       */
      const response = await fetch(
        `/api/conversations/${selectedConversationId}/messages`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageIds: [messageId],
            content: trimmedText,
          }),
        },
      );

      /**
       * --------------------------------------------------------
       * 3. Handle API error
       * --------------------------------------------------------
       */
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.message ||
            "Failed to edit message",
        );
      }

      /**
       * --------------------------------------------------------
       * 4. Read updated message
       * --------------------------------------------------------
       */
      const result = await response.json();

      const updatedMessage = result.data?.[0] as
        | {
            id: string;
            content: string;
          }
        | undefined;

      if (!updatedMessage) {
        throw new Error(
          "Message was not updated",
        );
      }

      /**
       * --------------------------------------------------------
       * 5. Update local UI
       *
       * Realtime UPDATE will also reach the other user.
       * --------------------------------------------------------
       */
      setMessagesByConversation(
        (currentMessages) => {
          const currentConversationMessages =
            currentMessages[
              selectedConversationId
            ] ?? [];

          return {
            ...currentMessages,

            [selectedConversationId]:
              currentConversationMessages.map(
                (message) =>
                  message.id ===
                  updatedMessage.id
                    ? {
                        ...message,
                        text:
                          updatedMessage.content,
                      }
                    : message,
              ),
          };
        },
      );
    } catch (error) {
      console.error(
        "Failed to edit message:",
        error,
      );
    }
  };

  /* ==========================================================
   * DELETE MESSAGE
   *
   * UI-only for now.
   * ========================================================== */

  const handleDeleteMessage = (
    messageId: string,
  ) => {
    setMessagesByConversation(
      (currentMessages) => {
        const currentConversationMessages =
          currentMessages[
            selectedConversationId
          ] ?? [];

        return {
          ...currentMessages,

          [selectedConversationId]:
            currentConversationMessages.filter(
              (message) =>
                message.id !== messageId,
            ),
        };
      },
    );
  };

  /* ==========================================================
   * CURRENT MESSAGES
   * ========================================================== */

  const currentMessages =
    messagesByConversation[
      selectedConversationId
    ] ?? [];

  /* ==========================================================
   * LAST MESSAGE PREVIEW
   * ========================================================== */

  const lastMessagePreviewByConversation:
    Record<
      ConversationId,
      string
    > = Object.fromEntries(
      Object.entries(
        messagesByConversation,
      ).map(
        ([conversationId, messages]) => {
          const lastMessage =
            messages[
              messages.length - 1
            ];

          return [
            conversationId,
            lastMessage?.text ?? "",
          ];
        },
      ),
    ) as Record<
      ConversationId,
      string
    >;

  /* ==========================================================
   * LAST MESSAGE TIME
   * ========================================================== */

  const lastMessageTimeByConversation:
    Record<
      ConversationId,
      string
    > = Object.fromEntries(
      Object.entries(
        messagesByConversation,
      ).map(
        ([conversationId, messages]) => {
          const lastMessage =
            messages[
              messages.length - 1
            ];

          return [
            conversationId,
            lastMessage?.time ?? "",
          ];
        },
      ),
    ) as Record<
      ConversationId,
      string
    >;

  /* ==========================================================
   * ACTIVE CONVERSATION NAME
   * ========================================================== */

  const conversationNames: Record<
    ConversationId,
    string
  > = Object.fromEntries(
    conversations.map(
      (conversation) => [
        conversation.id,
        conversation.name,
      ],
    ),
  );

  const activeConversationName =
    conversationNames[
      selectedConversationId
    ] ?? "ការសន្ទនា";

  /* ==========================================================
   * RENDER
   * ========================================================== */

  return (
    <AppShell
      sidebar={<Sidebar />}
      rightPanel={
        <RightPanel
          conversationName={
            activeConversationName
          }
          presence={
            presenceByConversation[
              selectedConversationId
            ]
          }
          currentUserPresence={currentUserPresence}
          lastSeenText={formatLastSeen(
            presenceByConversation[
              selectedConversationId
            ]?.lastSeenAt,
          )}
        />
      }
    >
      {/* ======================================================
       * DESKTOP / TABLET CONTENT
       * ====================================================== */}

      <div className="flex min-h-0 min-w-0 flex-1">
        {/* ====================================================
         * CONVERSATION LIST
         * ==================================================== */}

        <div
          className={
            showMobileChat
              ? "hidden md:flex"
              : "flex"
          }
        >
          <ConversationList
            conversations={
              conversations
            }
            isLoading={
              isLoadingConversations
            }
            selectedConversationId={
              selectedConversationId
            }
            onSelectConversation={
              handleSelectConversation
            }
            unreadCounts={
              unreadCounts
            }
            lastMessagePreviewByConversation={
              lastMessagePreviewByConversation
            }
            lastMessageTimeByConversation={
              lastMessageTimeByConversation
            }
          />
        </div>

        {/* ====================================================
         * DESKTOP CHAT
         * ==================================================== */}

        <div className="hidden min-w-0 flex-1 flex-col md:flex">
          <div className="min-h-0 flex-1">
            <ChatArea
              conversationId={
                selectedConversationId
              }
              messages={
                currentMessages
              }
              presence={
                presenceByConversation[
                  selectedConversationId
                ]
              }
              isTyping={isTyping}
              onSendMessage={
                handleSendMessage
              }
              onEditMessage={
                handleEditMessage
              }
              onDeleteMessage={
                handleDeleteMessage
              }
              onTypingChange={
                handleTypingChange
              }
            />
          </div>
        </div>
      </div>

      {/* ======================================================
       * MOBILE CHAT SCREEN
       * ====================================================== */}

      {showMobileChat && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            min-h-0
            flex-col
            bg-[var(--background)]
            md:hidden
          "
        >
          <div className="min-h-0 flex-1">
            <ChatArea
              conversationId={
                selectedConversationId
              }
              messages={
                currentMessages
              }
              presence={
                presenceByConversation[
                  selectedConversationId
                ]
              }
              isTyping={isTyping}
              onBack={
                handleMobileBack
              }
              onSendMessage={
                handleSendMessage
              }
              onEditMessage={
                handleEditMessage
              }
              onDeleteMessage={
                handleDeleteMessage
              }
              onTypingChange={
                handleTypingChange
              }
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}