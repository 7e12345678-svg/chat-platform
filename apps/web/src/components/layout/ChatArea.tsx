"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Avatar } from "@/components/ui/Avatar";
import { MessageComposer } from "@/components/layout/MessageComposer";
import {
  subscribeToMessages,
  subscribeToReactions,
} from "@/lib/chat/realtime";

/* ============================================================
   TYPES
   ============================================================ */

/**
 * តំណាងឱ្យសារមួយ។
 */
export interface MessageReply {
  id: string;
  sender: "me" | "other";
  text: string;
}

export interface Message {
  id: string;
  sender: "me" | "other";
  text: string;
  time: string;

  imageUrl?: string | null;

  status?: "sent" | "delivered" | "read";

  replyTo?: MessageReply;
  
}

// ============================================================
// វត្តមានអ្នកប្រើ
// តំណាងឱ្យស្ថានភាពអនឡាញ/ក្រៅបណ្តាញរបស់សមាជិកក្នុងការសន្ទនា។
// ============================================================
export interface UserPresence {
  status: "online" | "offline";
  lastSeen?: string;
  lastSeenAt?: number;
}

/* ============================================================
 * ប្រភេទប្រតិកម្ម
 * ============================================================ */

interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}


/**
 * តំណាងឱ្យព័ត៌មានការសន្ទនា។
 */
interface Conversation {
  id: string;
  name: string;
  fallback: string;
  online: boolean;
  messages: Message[];
}


/**
 * Props ដែលទទួលបានពីទំព័រមេ។
 */
export interface ChatAreaProps {
  conversationId: string;
  messages: Message[];
  isTyping?: boolean;
  onBack?: () => void;
  // ============================================================
// វត្តមានអ្នកប្រើ
// ស្ថានភាពអនឡាញ/ក្រៅបណ្តាញបច្ចុប្បន្នរបស់ការសន្ទនា។
// ============================================================
presence?: UserPresence;

  /**
   * ផ្ញើសារទៅទំព័រមេ។
   *
   * ទំព័រមេគ្រប់គ្រងស្ថានភាពសារ។
   */
 onSendMessage: (
  text: string,
  replyTo?: MessageReply,
  file?:File,
) => void;

onEditMessage: (
  messageId: string,
  text: string,
) => void;

onDeleteMessage: (
  messageId: string,
) => void;

onSelectFile?: (file: File) => void;

  /**
   * ផ្ញើស្ថានភាពកំពុងវាយទៅទំព័រមេ។
   */
  onTypingChange: (isTyping: boolean) => void;
}


/* ============================================================
   ទិន្នន័យការសន្ទនាគំរូ
   ============================================================ */

/**
 * ទិន្នន័យការសន្ទនាបណ្តោះអាសន្ន។
 *
 * សំខាន់៖
 * នេះគឺជាទិន្នន័យគំរូសម្រាប់ UI ប៉ុណ្ណោះ។
 *
 * ពេលក្រោយ៖
 *
 * API
 *  ↓
 * PostgreSQL
 *  ↓
 * សេវាកម្មការសន្ទនា
 *  ↓
 * ChatArea
 */
const conversations: Record<string, Conversation> = {
  /* ==========================================================
     SOPHEAK
     ========================================================== */

  sopheak: {
    id: "sopheak",
    name: "Sopheak",
    fallback: "S",
    online: true,

    messages: [
      {
        id: "sopheak-1",
        sender: "other",
        text: "សួស្តី! អ្នកសុខសប្បាយជាទេ?",
        time: "10:24 AM",
      },
      {
        id: "sopheak-2",
        sender: "me",
        text: "ខ្ញុំសុខសប្បាយទេ! អរគុណដែលបានសួរ។",
        time: "10:25 AM",
      },
      {
        id: "sopheak-3",
        sender: "other",
        text: "តើអ្នកកំពុងធ្វើការលើគម្រោងថ្មីមែនទេ?",
        time: "10:26 AM",
      },
      {
        id: "sopheak-4",
        sender: "me",
        text: "បាទ/ចាស ខ្ញុំកំពុងបង្កើតវេទិកាជជែកឥឡូវនេះ។",
        time: "10:27 AM",
      },
      {
        id: "sopheak-5",
        sender: "other",
        text: "ល្អណាស់! វាមើលទៅគួរឱ្យចាប់អារម្មណ៍។",
        time: "10:28 AM",
      },
    ],
  },


  /* ==========================================================
     DARA
     ========================================================== */

  dara: {
    id: "dara",
    name: "Dara",
    fallback: "D",
    online: true,

    messages: [
      {
        id: "dara-1",
        sender: "other",
        text: "សួស្តី! ថ្ងៃស្អែកអ្នកទំនេរទេ?",
        time: "9:40 AM",
      },
      {
        id: "dara-2",
        sender: "me",
        text: "បាទ/ចាស ខ្ញុំគិតថាខ្ញុំទំនេរ។",
        time: "9:42 AM",
      },
      {
        id: "dara-3",
        sender: "other",
        text: "ល្អណាស់។ ជួបគ្នាថ្ងៃស្អែក!",
        time: "9:43 AM",
      },
    ],
  },


  /* ==========================================================
     VANNA
     ========================================================== */

  vanna: {
    id: "vanna",
    name: "Vanna",
    fallback: "V",
    online: false,

    messages: [
      {
        id: "vanna-1",
        sender: "other",
        text: "អរគុណសម្រាប់ជំនួយរបស់អ្នក។",
        time: "8:20 AM",
      },
      {
        id: "vanna-2",
        sender: "me",
        text: "មិនអីទេ!",
        time: "8:22 AM",
      },
    ],
  },


  /* ==========================================================
     DEVELOPMENT TEAM
     ========================================================== */

  "development-team": {
    id: "development-team",
    name: "ក្រុមអភិវឌ្ឍន៍",
    fallback: "D",
    online: true,

    messages: [
      {
        id: "team-1",
        sender: "other",
        text: "មុខងារថ្មីរួចរាល់ហើយ។",
        time: "8:00 AM",
      },
      {
        id: "team-2",
        sender: "me",
        text: "ល្អណាស់! ខ្ញុំនឹងពិនិត្យវានៅថ្ងៃនេះ។",
        time: "8:05 AM",
      },
      {
        id: "team-3",
        sender: "other",
        text: "សូមប្រាប់យើងប្រសិនបើអ្នករកឃើញបញ្ហាណាមួយ។",
        time: "8:06 AM",
      },
    ],
  },


  /* ==========================================================
     FAMILY
     ========================================================== */

  family: {
    id: "family",
    name: "គ្រួសារ",
    fallback: "F",
    online: false,

    messages: [
      {
        id: "family-1",
        sender: "other",
        text: "អាហារពេលល្ងាចនៅម៉ោង 7:00 យប់។",
        time: "7:10 AM",
      },
      {
        id: "family-2",
        sender: "me",
        text: "បាន ខ្ញុំនឹងទៅទីនោះ។",
        time: "7:12 AM",
      },
      {
        id: "family-3",
        sender: "other",
        text: "ជួបគ្នាយប់នេះ!",
        time: "7:13 AM",
      },
    ],
  },
};


/* ============================================================
   COMPONENT
   ============================================================ */

/**
 * ChatArea
 *
 * បង្ហាញការសន្ទនាដែលបានជ្រើសបច្ចុប្បន្ន។
 */
export function ChatArea({
  conversationId,
  messages,
  isTyping = false,
  onBack,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onTypingChange,
  onSelectFile,
  presence,
}: ChatAreaProps) {

  const [selectedImageUrl, setSelectedImageUrl,] 
        = useState<string | null>(null);

        /* ==========================================================
 * CLOSE IMAGE LIGHTBOX WITH ESC
 * ========================================================== */

useEffect(() => {
  if (!selectedImageUrl) {
    return;
  }

  const handleKeyDown = (
    event: KeyboardEvent,
  ) => {
    if (event.key === "Escape") {
      setSelectedImageUrl(null);
    }
  };

  window.addEventListener(
    "keydown",
    handleKeyDown,
  );

  return () => {
    window.removeEventListener(
      "keydown",
      handleKeyDown,
    );
  };
}, [selectedImageUrl]);

  /* ==========================================================
 * ចាប់ផ្តើមកែសម្រួលសារ
 * ========================================================== */

const handleStartEdit = (message: Message) => {
  // អនុញ្ញាតឱ្យកែសម្រួលតែសាររបស់ខ្លួនប៉ុណ្ណោះ។
  if (message.sender !== "me") {
    return;
  }

  setEditingMessageId(message.id);
  setEditingText(message.text);

  setActiveMessageId(null);
  setReactionMessageId(null);
  setReplyingTo(null);
};


/* ==========================================================
 * បោះបង់ការកែសម្រួលសារ
 * ========================================================== */

const handleCancelEdit = () => {
  setEditingMessageId(null);
  setEditingText("");
};


/* ==========================================================
 * រក្សាទុកការកែសម្រួលសារ
 * ========================================================== */

const handleSaveEdit = () => {
  const trimmedText = editingText.trim();

  if (!editingMessageId || !trimmedText) {
    return;
  }

  onEditMessage(
    editingMessageId,
    trimmedText,
  );

  setEditingMessageId(null);
  setEditingText("");
};

    /* ==========================================================
   * ស្ថានភាពសកម្មភាពសារ
   * ========================================================== */

  const [activeMessageId, setActiveMessageId] = useState<string | null>(
    null,
  );

  /* ==========================================================
 * ស្ថានភាពកែសម្រួលសារ
 * ========================================================== */

const [editingMessageId, setEditingMessageId] =
  useState<string | null>(null);

  // ============================================================
// ការបញ្ជាក់លុបសារ
// រក្សាទុក ID សារដែលកំពុងរង់ចាំការបញ្ជាក់លុប។
// ============================================================
const [deletingMessageId, setDeletingMessageId] =
  useState<string | null>(null);

const [editingText, setEditingText] =
  useState("");
  

  /**
 * គ្រប់គ្រងថាតើសារណាបង្ហាញ
 * ឧបករណ៍ជ្រើសប្រតិកម្មរហ័ស។
 */

  const [reactionMessageId, setReactionMessageId] = useState<string | null>(
  null,
);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  /* ==========================================================
 * ស្ថានភាពរមូរ
 * ========================================================== */

const [showScrollButton, setShowScrollButton] = useState(false);
const [newMessageCount, setNewMessageCount] = useState(0);

  /* ==========================================================
 * ស្ថានភាពប្រតិកម្ម
 * ========================================================== */

const [reactions, setReactions] = useState<
  Record<string, MessageReaction[]>
>({});

  /* ==========================================================
   * ស្ថានភាពសារក្នុងមូលដ្ឋាន
   *
   * រក្សាសារដែលទើបផ្ញើឱ្យមើលឃើញភ្លាមៗ ខណៈពេល
   * backend/ស្រទាប់ពេលវេលាពិតកំពុងត្រូវបានអភិវឌ្ឍ។
   * ========================================================== */

  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  /* ----------------------------------------------------------
   * ធ្វើសមកាលកម្មសារពីទំព័រមេ
   *
   * ពេលទំព័រមេទទួលសារដែលបានធ្វើបច្ចុប្បន្នភាពពី API ឬ
   * ស្រទាប់ពេលវេលាពិត ត្រូវធ្វើបច្ចុប្បន្នភាពបញ្ជីបង្ហាញក្នុងមូលដ្ឋាន។
   * ---------------------------------------------------------- */

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  /* ==========================================================
 * SEND MESSAGE FROM COMPOSER
 *
 * Supports:
 * - Text
 * - Image
 * - Image + text
 * - Reply + image
 * ========================================================== */

const handleComposerSendMessage = (
  text: string,
  file?: File,
) => {
  const trimmedText =
    text.trim();

  // Allow image-only messages.
  if (
    !trimmedText &&
    !file
  ) {
    return;
  }

  const replyReference =
    replyingTo
      ? {
          id: replyingTo.id,
          sender: replyingTo.sender,
          text: replyingTo.text,
        }
      : undefined;

  onSendMessage(
    trimmedText,
    replyReference,
    file,
  );

  /* --------------------------------------------------------
   * Clear reply mode.
   * -------------------------------------------------------- */

  setReplyingTo(null);
};

/* ==========================================================
 * ប្រតិកម្មរហ័ស
 * ========================================================== */

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

/* ==========================================================
 * បិទ/បើកប្រតិកម្ម
 *
 * បច្ចុប្បន្នសម្រាប់ UI ក្នុងមូលដ្ឋានប៉ុណ្ណោះ។
 * ពេលក្រោយវានឹងហៅ Messages API។
 * ========================================================== */

/* ==========================================================
 * REACTION API
 * ========================================================== */

const getReactionsApiUrl = (
  messageId: string,
) =>
  `/api/conversations/${encodeURIComponent(
    conversationId,
  )}/messages/${encodeURIComponent(
    messageId,
  )}/reactions`;

/* ==========================================================
 * LOAD REACTIONS
 * ========================================================== */

const loadMessageReactions = async (
  messageId: string,
) => {
  try {
    const response = await fetch(
      getReactionsApiUrl(messageId),
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return;
    }

    const result = await response.json();

    if (!result.success) {
      return;
    }

    setReactions((current) => ({
      ...current,
      [messageId]: Array.isArray(result.data)
        ? result.data
        : [],
    }));
  } catch (error) {
    console.error(
      "Failed to load message reactions:",
      error,
    );
  }
};

/* ==========================================================
 * LOAD REACTIONS FOR CURRENT MESSAGES
 * ========================================================== */

/* ==========================================================
 * LOAD ALL REACTIONS FOR CURRENT CONVERSATION
 *
 * Uses ONE API request for the whole conversation.
 * ========================================================== */

const loadConversationReactions = async () => {
  try {
    const response = await fetch(
      `/api/conversations/${encodeURIComponent(
        conversationId,
      )}/reactions`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return;
    }

    const result = await response.json();

    if (!result.success) {
      return;
    }

    setReactions(
      result.data &&
        typeof result.data === "object"
        ? result.data
        : {},
    );
  } catch (error) {
    console.error(
      "Failed to load conversation reactions:",
      error,
    );
  }
};

/* ==========================================================
 * LOAD REACTIONS WHEN CONVERSATION / MESSAGE COUNT CHANGES
 * ========================================================== */

useEffect(() => {
  if (!conversationId) {
    return;
  }

  void loadConversationReactions();
}, [conversationId, localMessages.length]);

useEffect(() => {
  if (!conversationId) {
    return;
  }

  let cancelled = false;

  const channel = subscribeToReactions(() => {
    if (cancelled) {
      return;
    }
    void loadConversationReactions();
  });

  return () => {
    cancelled = true;
    void channel.unsubscribe();
  };
  }, [conversationId]);

/* ==========================================================
 * TOGGLE REACTION
 *
 * If the current user already reacted:
 *   DELETE
 *
 * Otherwise:
 *   POST
 * ========================================================== */

const handleReaction = async (
  messageId: string,
  emoji: string,
) => {
  try {
    const currentReactions =
      reactions[messageId] ?? [];

    const existingReaction =
      currentReactions.find(
        (reaction) =>
          reaction.emoji === emoji,
      );

    const alreadyReacted =
      existingReaction?.reacted === true;

    const response = await fetch(
      getReactionsApiUrl(messageId),
      {
        method: alreadyReacted
          ? "DELETE"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          emoji,
        }),
      },
    );

    const result =
      await response.json().catch(
        () => null,
      );

    if (!response.ok) {
      console.error(
        "Reaction request failed:",
        result,
      );

      return;
    }

    await loadMessageReactions(
      messageId,
    );
  } catch (error) {
    console.error(
      "Failed to update reaction:",
      error,
    );
  } finally {
    setActiveMessageId(null);
    setReactionMessageId(null);
  }
};


      /* ==========================================================
     រមូរស្វ័យប្រវត្តិ
     ========================================================== */

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

    const messagesContainerRef =
  useRef<HTMLDivElement | null>(null);


  /**
   * រមូរទៅសារថ្មីបំផុត រាល់ពេល
   * បញ្ជីសារផ្លាស់ប្តូរ។
   */
    /* ==========================================================
 * រមូរស្វ័យប្រវត្តិ
 *
 * រមូរស្វ័យប្រវត្តិតែពេលអ្នកប្រើនៅជិត
 * ផ្នែកខាងក្រោមនៃការសន្ទនា។
 * ========================================================== */
const hasInitializedMessages =
  useRef(false);

  const handleMessagesScroll = () => {
  const container = messagesContainerRef.current;

  if (!container) {
    return;
  }

  const distanceFromBottom =
    container.scrollHeight -
    container.scrollTop -
    container.clientHeight;

  const isNearBottom = distanceFromBottom < 120;

  setShowScrollButton(!isNearBottom);

  if (isNearBottom) {
    setNewMessageCount(0);
  }
};

 useEffect(() => {
  const container = messagesContainerRef.current;

  if (!container) {
    return;
  }

  const distanceFromBottom =
    container.scrollHeight -
    container.scrollTop -
    container.clientHeight;

  const isNearBottom = distanceFromBottom < 120;

  if (!hasInitializedMessages.current) {
    hasInitializedMessages.current = true;

    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });

    return;
  }

  if (isNearBottom) {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

    setNewMessageCount(0);
  } else {
    setNewMessageCount((count) => count + 1);
  }
}, [localMessages]);

  /* ==========================================================
     ទទួលការសន្ទនាដែលបានជ្រើស
     ========================================================== */

  const conversation =
    conversations[conversationId] ??
    conversations.sopheak;


  /* ==========================================================
     បង្ហាញ
     ========================================================== */

  return (
    <section
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-[var(--background)]
      "
    >


        {/* ============================================================
 * CHAT HEADER
 * ============================================================ */}

<header
  className="
    flex
    h-[var(--header-height)]
    shrink-0
    items-center
    justify-between
    border-b
    border-[var(--border)]
    bg-[var(--surface)]
    px-4
    py-2.5
    shadow-sm
    transition-all
    duration-200
  "
>
  {/* ==========================================================
   * LEFT SIDE
   * ========================================================== */}

  <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
    {/* --------------------------------------------------------
     * MOBILE BACK BUTTON
     *
     * Only visible on mobile.
     * -------------------------------------------------------- */}

    {onBack && (
      <button
        type="button"
        onClick={onBack}
        aria-label="ត្រឡប់ទៅការសន្ទនា"
        title="ត្រឡប់ទៅការសន្ទនា"
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          text-xl
          text-[var(--text-secondary)]
          transition-all
          duration-150
          hover:scale-105
          hover:bg-[var(--surface-hover)]
          hover:text-[var(--text-primary)]
          active:scale-95
          md:hidden
        "
      >
        ←
      </button>
    )}

    {/* --------------------------------------------------------
     * AVATAR
     * -------------------------------------------------------- */}

    <Avatar
  fallback={conversation?.fallback ?? "S"}
  size="md"
  online={presence?.status === "online"}
  className="transition-transform duration-200 hover:scale-[1.03]"
/>

    {/* --------------------------------------------------------
     * USER / CONVERSATION INFO
     * -------------------------------------------------------- */}

    <div className="min-w-0">
      <h2 className="
  truncate
  text-sm
  font-semibold
  text-[var(--text-primary)]
  transition-colors
  duration-200
">
        {conversation?.name ?? "ការសន្ទនា"}
      </h2>

      <p
        className={[
          "mt-0.5 truncate text-xs leading-4 transition-all duration-200",
          isTyping
            ? "font-medium text-[var(--primary)]"
            : "text-[var(--text-secondary)]",
        ].join(" ")}
      >
         {isTyping
  ? "កំពុងវាយ..."
  : presence?.status === "online"
    ? "កំពុងអនឡាញ"
    : presence?.lastSeen
      ? `បានឃើញចុងក្រោយ ${presence.lastSeen}`
      : "ក្រៅបណ្តាញ"}
      </p>
    </div>
  </div>

  {/* ==========================================================
   * RIGHT SIDE ACTIONS
   * ========================================================== */}

  <div className="flex shrink-0 items-center gap-1.5">
    {/* --------------------------------------------------------
     * CALL BUTTON
     * -------------------------------------------------------- */}

    <button
      type="button"
      aria-label="ចាប់ផ្តើមការហៅ"
      title="ចាប់ផ្តើមការហៅ"
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        text-base
        text-[var(--text-secondary)]
        transition-all
        duration-150
        hover:scale-[1.04]
        hover:bg-[var(--surface-hover)]
        hover:text-[var(--text-primary)]
        active:scale-95
      "
    >
      ☎
    </button>

    {/* --------------------------------------------------------
     * VIDEO BUTTON
     * -------------------------------------------------------- */}

    <button
      type="button"
      aria-label="ចាប់ផ្តើមការហៅវីដេអូ"
      title="ចាប់ផ្តើមការហៅវីដេអូ"
      className="
        hidden
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        text-base
        text-[var(--text-secondary)]
        transition-all
        duration-150
        hover:scale-[1.04]
        hover:bg-[var(--surface-hover)]
        hover:text-[var(--text-primary)]
        active:scale-95
        sm:flex
      "
    >
      ▣
    </button>

    {/* --------------------------------------------------------
     * MORE BUTTON
     * -------------------------------------------------------- */}

    <button
      type="button"
      aria-label="ជម្រើសការសន្ទនាបន្ថែម"
      title="ជម្រើសបន្ថែម"
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        text-lg
        text-[var(--text-secondary)]
        transition-all
        duration-150
        hover:scale-105
        hover:bg-[var(--surface-hover)]
        hover:text-[var(--text-primary)]
        active:scale-95
      "
    >
      
      ⋮
    </button>
  </div>

  </header>

  

      {/* ======================================================
         MESSAGE HISTORY
         ====================================================== */}

      <div
  ref={messagesContainerRef}
  onScroll={handleMessagesScroll}
  className="relative min-h-0 flex-1 overflow-y-auto"
>

        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-3 py-5 sm:px-4 sm:py-6">

<div className="space-y-1">
  {localMessages.length === 0 ? (
   <div className="flex min-h-[320px] items-center justify-center px-6 transition-all duration-200">
      <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-hover)] text-2xl shadow-sm transition-transform duration-200 hover:scale-[1.04] hover:shadow-md">
          💬
      </div>

        <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)] transition-all duration-200">
          មិនទាន់មានសារ
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-sm leading-5 text-[var(--text-secondary)] transition-all duration-200">
          ចាប់ផ្តើមការសន្ទនាដោយផ្ញើសារដំបូង។
        </p>
      </div>
    </div>
  ) : (
    localMessages.map((message, index) => {
    /* --------------------------------------------------------
     * MESSAGE GROUPING
     *
     * Check the previous and next message sender.
     * -------------------------------------------------------- */

    const isMine = message.sender === "me";

    const previousMessage = localMessages[index - 1];
    const nextMessage = localMessages[index + 1];

    const isFirstInGroup =
      !previousMessage ||
      previousMessage.sender !== message.sender;

    const isLastInGroup =
      !nextMessage ||
      nextMessage.sender !== message.sender;

    /* --------------------------------------------------------
     * GROUP SPACING
     *
     * Bigger gap when sender changes.
     * Smaller gap inside the same group.
     * -------------------------------------------------------- */

    const spacingClass = isFirstInGroup
      ? "mt-3"
      : "mt-0.5";

    return (
      <div
        key={message.id}
        className={[
          "group flex w-full",
          spacingClass,
          isMine ? "justify-end" : "justify-start",
        ].join(" ")}
      >
        {/* ====================================================
         * MESSAGE ROW
         * ==================================================== */}

        <div
          className={[
            "flex max-w-[88%] items-end gap-2 sm:max-w-[72%] lg:max-w-[65%]",
            isMine ? "flex-row-reverse" : "flex-row",
          ].join(" ")}
        >
          {/* ==================================================
           * MESSAGE BUBBLE
           * ================================================== */}

          <div
            className={[
              "min-w-0 px-3.5 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md",
              isMine
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]",

              /* ----------------------------------------------
               * BUBBLE CORNERS
               * ---------------------------------------------- */

              isMine
                ? isFirstInGroup
                  ? "rounded-2xl rounded-br-md"
                  : isLastInGroup
                    ? "rounded-2xl rounded-tr-md"
                    : "rounded-xl rounded-r-md"
                : isFirstInGroup
                  ? "rounded-2xl rounded-bl-md"
                  : isLastInGroup
                    ? "rounded-2xl rounded-tl-md"
                    : "rounded-xl rounded-l-md",
            ].join(" ")}
          >

            {/* ------------------------------------------------
 * REPLY REFERENCE
 *
 * Shows the original message that this message
 * is replying to.
 * ------------------------------------------------ */}

{editingMessageId === message.id ? (
  <div className="min-w-[220px] space-y-2">
    <textarea
      value={editingText}
      onChange={(event) =>
        setEditingText(event.target.value)
      }
      autoFocus
      rows={3}
      className="
        w-full
        resize-none
        rounded-lg
        border
        border-white/20
        bg-black/10
        px-3
        py-2
        text-sm
        text-white
        outline-none
        placeholder:text-white/50
        focus:border-white/40
      "
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {
          event.preventDefault();
          handleSaveEdit();
        }

        if (event.key === "Escape") {
          handleCancelEdit();
        }
      }}
    />

    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={handleCancelEdit}
        className="
          rounded-md
          px-2.5
          py-1.5
          text-xs
          text-white/70
          transition-colors
          hover:bg-white/10
        "
      >
        បោះបង់
      </button>

      <button
        type="button"
        onClick={handleSaveEdit}
        disabled={!editingText.trim()}
        className="
          rounded-md
          bg-white/20
          px-2.5
          py-1.5
          text-xs
          text-white
          transition-colors
          hover:bg-white/30
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        រក្សាទុក
      </button>
    </div>
  </div>
) : (
  <>
     
     {message.imageUrl && (
  <img
    src={message.imageUrl}
    alt="Shared image"
    className="
      mb-2
      max-h-80
      max-w-full
      cursor-pointer
      rounded-xl
      object-cover
      transition-transform
      duration-150
      hover:scale-[1.01]
    "
    loading="lazy"
    onClick={() => {
      setSelectedImageUrl(
        message.imageUrl ?? null,
      );
    }}
  />
)}

    {/* ============================================================
     * MESSAGE TEXT
     * ============================================================ */}
    {message.text && (
      <p className="whitespace-pre-wrap break-words text-sm leading-5">
        {message.text}
      </p>
    )}
  </>
)}

 {/* ------------------------------------------------
 * MESSAGE REACTIONS
 *
 * Displays reactions that users added to this message.
 * ------------------------------------------------ */}

{(reactions[message.id]?.length ?? 0) > 0 && (
  <div
    className="
      mt-1
      flex
      flex-wrap
      items-center
      gap-1
    "
  >
    {reactions[message.id].map((reaction) => (
      <button
        key={reaction.emoji}
        type="button"
        onClick={() =>
          handleReaction(
            message.id,
            reaction.emoji,
          )
        }
        className={[
          "inline-flex items-center gap-1",
          "rounded-full border px-2 py-0.5",
          "text-xs transition-all duration-150",
          reaction.reacted
            ? "border-[var(--primary)] bg-white/10"
            : "border-[var(--border)] bg-[var(--surface)]",
          "hover:bg-[var(--surface-hover)]",
          "hover:scale-105 active:scale-95",
        ].join(" ")}
        aria-label={`ប្រតិកម្ម ${reaction.emoji}`}
      >
        <span>{reaction.emoji}</span>

        <span className="text-[10px]">
          {reaction.count}
        </span>
      </button>
    ))}
  </div>
)}

            {/* ------------------------------------------------
             * TIMESTAMP
             *
             * Only show timestamp on the last message
             * of each sender group.
             * ------------------------------------------------ */}

            {isLastInGroup && (
  <div
    className={[
      "mt-1 flex items-center gap-1 text-[10px] leading-4 opacity-80",
      isMine
        ? "text-white/70"
        : "text-[var(--text-muted)]",
    ].join(" ")}
  >
    <span>{message.time}</span>

    {/* ========================================================
        MESSAGE STATUS
        Only show status for messages sent by the current user.
       ======================================================== */}
    {isMine && (
  <span
    aria-label={`សារ ${message.status ?? "sent"}`}
    title={
      message.status === "read"
        ? "បានអាន"
        : message.status === "delivered"
          ? "បានបញ្ជូន"
          : "បានផ្ញើ"
    }
    className={
      message.status === "read"
        ? "font-semibold text-white transition-all duration-200"
        : message.status === "delivered"
          ? "text-white/70 transition-all duration-200"
          : "text-white/50 transition-all duration-200"
    }
  >
    {message.status === "read"
      ? "✓✓"
      : message.status === "delivered"
        ? "✓✓"
        : "✓"}
  </span>
)}
  </div>
)}

          </div>
    {/* ============================================================
 * MESSAGE ACTIONS
 * ============================================================ */}

<div className="relative shrink-0">

  {/* ==========================================================
   * MOBILE ACTION BUTTON
   *
   * Mobile does not have hover.
   * Therefore the button is always visible on mobile.
   * ========================================================== */}

  <button
    type="button"
    onClick={() => {
      setActiveMessageId((current) =>
        current === message.id ? null : message.id,
      );

      setReactionMessageId(null);
    }}
    aria-label="ជម្រើសសារ"
    title="ជម្រើសសារ"
    className="
      flex
      h-8
      w-8
      items-center
      justify-center
      rounded-lg
      text-sm
      text-[var(--text-muted)]
      transition-all
      duration-150
      hover:scale-105
      hover:bg-[var(--surface-hover)]
      hover:text-[var(--text-primary)]
      active:scale-95
      md:hidden
    "
  >
    ⋯
  </button>
  


  {/* ==========================================================
   * DESKTOP ACTION BUTTON
   *
   * Desktop keeps the hover behavior.
   * ========================================================== */}

  <button
    type="button"
    onClick={() => {
      setActiveMessageId((current) =>
        current === message.id ? null : message.id,
      );

      setReactionMessageId(null);
    }}
    aria-label="ជម្រើសសារ"
    title="ជម្រើសសារ"
    className="
  hidden
  h-7
  w-7
  items-center
  justify-center
  rounded-md
  text-sm
  text-[var(--text-muted)]
  opacity-0
  transition-all
  duration-200
  hover:bg-[var(--surface-hover)]
  hover:text-[var(--text-primary)]
  group-hover:opacity-100
  md:group-hover:flex
"
  >
    ⋯
  </button>


  {/* ==========================================================
   * ACTION MENU
   * ========================================================== */}

  {activeMessageId === message.id && (
    <div
      className={[
        "absolute bottom-9 z-50 w-36 origin-bottom",
        "rounded-xl border",
        "border-(--border)",
        "bg-(--surface)",
        "p-1 shadow-xl",
        "animate-in fade-in zoom-in-95 duration-150",

        isMine
          ? "right-0"
          : "left-0",
      ].join(" ")}
    >

      {/* ========================================================
       * REPLY
       * ======================================================== */}

      <button
        type="button"
        onClick={() => {
          setReplyingTo(message);
          setActiveMessageId(null);
          setReactionMessageId(null);
        }}
        className="
          flex
          w-full
          items-center
          gap-2
          rounded-lg
          px-3
          py-2.5
          text-left
          text-xs
          text-(--text-primary)
          transition-all
          duration-150
          hover:bg-(--surface-hover)
          hover:translate-x-px
        "
      >
        <span>↩</span>

        <span>
          ឆ្លើយតប
        </span>
      </button>


      {/* ========================================================
       * REACT
       * ======================================================== */}

      <button
        type="button"
        onClick={() => {
          setReactionMessageId((current) =>
            current === message.id
              ? null
              : message.id,
          );
        }}
        className="
          flex
          w-full
          items-center
          gap-2
          rounded-lg
          px-3
          py-2.5
          text-left
          text-xs
          text-(--text-primary)
          transition-all
          duration-150
          hover:bg-(--surface-hover)
          hover:translate-x-px
        "
      >
        <span>❤️</span>

        <span>
          ប្រតិកម្ម
        </span>
      </button>

      {/* ========================================================
 * EDIT
 * ======================================================== */}

{isMine && (
  <button
    type="button"
    onClick={() => {
      handleStartEdit(message);
    }}
    className="
      flex
      w-full
      items-center
      gap-2
      rounded-lg
      px-3
      py-2.5
      text-left
      text-xs
      text-(--text-primary)
      transition-colors
      hover:bg-(--surface-hover)
    "
  >
    <span>✏️</span>

    <span>
      កែសម្រួល
    </span>
  </button>
)}

  {isMine && (
  <button
    type="button"
    onClick={() => {
  setDeletingMessageId(message.id);
  setActiveMessageId(null);
}}
    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-500/10"
  >
    <span>🗑️</span>
    <span>លុប</span>
  </button>
)}


      {/* ========================================================
       * COPY
       * ======================================================== */}

      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            ?.writeText(message.text)
            .catch(() => undefined);

          setActiveMessageId(null);
          setReactionMessageId(null);
        }}
        className="
          flex
          w-full
          items-center
          gap-2
          rounded-lg
          px-3
          py-2.5
          text-left
          text-xs
          text-(--text-primary)
          transition-all
          duration-150
          hover:bg-(--surface-hover)
          hover:translate-x-px
        "
      >
        <span>⧉</span>

        <span>
          ចម្លង
        </span>
      </button>

    </div>
  )}


  {/* ==========================================================
 * ឧបករណ៍ជ្រើសប្រតិកម្មរហ័ស
   *
 * បង្ហាញនៅពេលអ្នកប្រើជ្រើសប្រតិកម្ម។
   * ========================================================== */}

  {reactionMessageId === message.id && (
    <div
      className={[
        "absolute bottom-9 z-60",
        "flex items-center gap-1",
        "rounded-xl border",
        "border-(--border)",
        "bg-(--surface)",
        "p-1.5 shadow-xl",

        isMine
          ? "right-0"
          : "left-0",

        /* ទូរស័ព្ទ៖ រក្សាឧបករណ៍ជ្រើសនៅក្នុងអេក្រង់ */
        "max-w-[calc(100vw-2rem)]",
      ].join(" ")}
    >

      {quickReactions.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => {
            handleReaction(
              message.id,
              emoji,
            );

            setReactionMessageId(null);
            setActiveMessageId(null);
          }}
          aria-label={`ប្រតិកម្ម ${emoji}`}
          title={`ប្រតិកម្ម ${emoji}`}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-base
            transition-transform
            hover:scale-110
            hover:bg-(--surface-hover)
            active:scale-95
          "
        >
          {emoji}
        </button>
      ))}

    </div>
  )}

</div>

        </div>
      </div>
    );
}))}


</div>

{/* ============================================================
 * រមូរទៅខាងក្រោម
 * ============================================================ */}
 
{showScrollButton && (
  <button
    type="button"
    onClick={() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

      setNewMessageCount(0);
      setShowScrollButton(false);
    }}
    aria-label="រមូរទៅសារថ្មីបំផុត"
    title="រមូរទៅសារថ្មីបំផុត"
    className="
      absolute
      bottom-5
      right-5
      z-40
      flex
      min-h-9
      items-center
      gap-2
      rounded-full
      border
      border-(--border)
      bg-(--surface)
      px-3
      text-xs
      font-medium
      text-(--text-primary)
      shadow-lg
      transition-all
      animate-in
      fade-in
      slide-in-from-bottom-2
      duration-200
      hover:bg-(--surface-hover)
    "
  >
    <span>↓</span>

    {newMessageCount > 0 && (
      <span>
        {newMessageCount}{" "}
        {newMessageCount === 1
          ? "សារថ្មី"
          : "សារថ្មី"}
      </span>
    )}
  </button>
)}

{isTyping && (
  <div className="mt-2 flex items-end gap-3">

    <Avatar
      fallback={conversation.fallback}
      size="sm"
      online={conversation.online}
    />

    <div>

      <p className="mb-1 text-xs text-[var(--text-secondary)]">
        {conversation.name}
      </p>

      <div
        className="
          flex
          items-center
          gap-1.5
          rounded-2xl
          rounded-bl-md
          bg-(--surface)
          px-4
          py-3
        "
      >

        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-(--text-muted)" />

        <span
          className="
            h-1.5
            w-1.5
            animate-bounce
            rounded-full
            bg-(--text-muted)
            [animation-delay:100ms]
          "
        />

        <span
          className="
            h-1.5
            w-1.5
            animate-bounce
            rounded-full
            bg-(--text-muted)
            [animation-delay:200ms]
          "
        />

      </div>

    </div>

  </div>
)}

                    <div ref={messagesEndRef} />

        </div>

      </div>

      {/* ============================================================
 * ការមើលជាមុននៃការឆ្លើយតប
 * ============================================================ */}

{replyingTo && (
  <div
      className="
  shrink-0
  border-t
  border-(--border)
  bg-(--surface)
  px-4
  py-3
"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-(--primary)">
          កំពុងឆ្លើយតបទៅកាន់{" "}
          {replyingTo.sender === "me"
            ? "ខ្លួនអ្នក"
            : conversation.name}
        </p>

        <p className="mt-0.5 truncate text-xs text-(--text-secondary)">
          {replyingTo.text}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setReplyingTo(null)}
        aria-label="បោះបង់ការឆ្លើយតប"
        title="បោះបង់ការឆ្លើយតប"
        className="
  flex
  h-7
  w-7
  shrink-0
  items-center
  justify-center
  rounded-full
  text-sm
  text-(--text-muted)
  transition-all
  duration-150
  hover:bg-(--surface-hover)
  hover:text-(--text-primary)
  hover:scale-105
  active:scale-95
"
      >
        ×
      </button>
    </div>
  </div>
)}

      <MessageComposer
  onSendMessage={handleComposerSendMessage}
  onTypingChange={onTypingChange}
  onSelectFile={onSelectFile}
/>

{/* ============================================================
    ប្រអប់បញ្ជាក់ការលុបសារ
    បង្ហាញតែបន្ទាប់ពីអ្នកប្រើចុចលុប។
============================================================ */}
{deletingMessageId && (
  <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#171322] p-5 shadow-2xl">
      <h3 className="text-lg font-semibold text-white">
        លុបសារនេះមែនទេ?
      </h3>

      <p className="mt-2 text-sm text-white/60">
        តើអ្នកពិតជាចង់លុបសារនេះមែនទេ?
      </p>

      <div className="mt-5 flex justify-end gap-3">
        {/* បោះបង់ */}
        <button
          type="button"
          onClick={() => {
            setDeletingMessageId(null);
          }}
          className="rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          បោះបង់
        </button>

        {/* បញ្ជាក់ការលុប */}
        <button
          type="button"
          onClick={() => {
            onDeleteMessage(deletingMessageId);
            setDeletingMessageId(null);
          }}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          លុប
        </button>
      </div>
    </div>
  </div>
)}

  {/* ============================================================
 * IMAGE LIGHTBOX
 * ============================================================ */}

{selectedImageUrl && (
  <div
    className="
      fixed
      inset-0
      z-200
      flex
      items-center
      justify-center
      bg-black/80
      p-4
      backdrop-blur-sm
    "
    onClick={() => {
      setSelectedImageUrl(null);
    }}
  >
    {/* ========================================================
     * CLOSE BUTTON
     * ======================================================== */}

    <button
      type="button"
      aria-label="Close image preview"
      title="Close"
      onClick={() => {
        setSelectedImageUrl(null);
      }}
      className="
        absolute
        right-4
        top-4
        z-10
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        bg-black/60
        text-2xl
        text-white
        transition
        hover:bg-black/80
        active:scale-95
      "
    >
      ×
    </button>

    {/* ========================================================
     * FULL IMAGE
     * ======================================================== */}

    <img
      src={selectedImageUrl}
      alt="Full size shared image"
      className="
        max-h-[90vh]
        max-w-[95vw]
        rounded-xl
        object-contain
        shadow-2xl
      "
      onClick={(event) => {
        event.stopPropagation();
      }}
    />
  </div>
)}

    </section>
  );
}
