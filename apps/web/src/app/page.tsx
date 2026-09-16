"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { ChatArea } from "@/components/layout/ChatArea";
import { ConversationList } from "@/components/layout/ConversationList";
import { RightPanel } from "@/components/layout/RightPanel";
import { Sidebar } from "@/components/layout/Sidebar";
import type {
  Message,
  UserPresence,
} from "@/components/layout/ChatArea";


/* ============================================================
   TYPES
   ============================================================ */

type ConversationId = string;


/* ============================================================
   INITIAL MESSAGE DATA
   ============================================================ */

/**
 * ទិន្នន័យសារបណ្តោះអាសន្នក្នុងមូលដ្ឋាន។
 *
 * ការសន្ទនានីមួយៗមានបញ្ជីសារផ្ទាល់ខ្លួន។
 *
 * ពេលក្រោយ API / PostgreSQL / WebSocket
 * នឹងជំនួសស្ថានភាពបណ្តោះអាសន្ននេះ។
 */
const initialMessages: Record<
  ConversationId,
  Message[]
> = {

  /* ==========================================================
     SOPHEAK
     ========================================================== */

  sopheak: [
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


  /* ==========================================================
     DARA
     ========================================================== */

  dara: [
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


  /* ==========================================================
     VANNA
     ========================================================== */

  vanna: [
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


  /* ==========================================================
     DEVELOPMENT TEAM
     ========================================================== */

  "development-team": [
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


  /* ==========================================================
     FAMILY
     ========================================================== */

  family: [
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
};

// ============================================================
// ធ្វើទ្រង់ទ្រាយពេលឃើញចុងក្រោយ
// បម្លែងត្រាពេលវេលាទៅជាពេលវេលាដែលងាយអាន។
// ============================================================
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

  // ============================================================
// ធ្វើឱ្យពេលឃើញចុងក្រោយស្រស់ឡើងវិញ
// បង្ហាញទំព័រឡើងវិញរាល់នាទី ដើម្បីឱ្យពេលវេលាស្ថិតនៅថ្មីជានិច្ច។
// ============================================================
const LAST_SEEN_REFRESH_INTERVAL = 60 * 1000;

/**
 * Home
 *
 * អេក្រង់កម្មវិធីចម្បង។
 *
 * ភារកិច្ច៖
 * - គ្រប់គ្រងការសន្ទនាដែលបានជ្រើស។
 * - គ្រប់គ្រងការរុករកជជែកលើទូរស័ព្ទ។
 * - គ្រប់គ្រងសារក្នុងមូលដ្ឋាន។
 * - ភ្ជាប់សមាសភាគប្លង់។
 *
 * ពេលក្រោយ API និង WebSocket នឹងជំនួសស្ថានភាពក្នុងមូលដ្ឋាន។
 */
export default function Home() {

  // ============================================================
// កម្មវិធីកំណត់ពេលធ្វើឱ្យពេលឃើញចុងក្រោយស្រស់ឡើងវិញ
// បង្ហាញឡើងវិញរាល់នាទី។
// ============================================================
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
     ការសន្ទនាដែលបានជ្រើស
     ========================================================== */

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<ConversationId>("sopheak");


  /* ==========================================================
     ការរុករកជជែកលើទូរស័ព្ទ
     ========================================================== */

  /**
   * គ្រប់គ្រងថាតើអេក្រង់ជជែកលើទូរស័ព្ទត្រូវបង្ហាញឬអត់។
   *
   * false → បញ្ជីការសន្ទនា
   * true  → អេក្រង់ជជែក
   */
  const [
    showMobileChat,
    setShowMobileChat,
  ] = useState(false);


  /* ==========================================================
     ស្ថានភាពសារ
     ========================================================== */

  const [
    messagesByConversation,
    setMessagesByConversation,
  ] = useState<Record<
    ConversationId,
    Message[]
  >>(initialMessages);

  // ============================================================
// វត្តមានអ្នកប្រើ
// រក្សាទុកស្ថានភាពអនឡាញ/ក្រៅបណ្តាញសម្រាប់ការសន្ទនានីមួយៗ។
// ============================================================
const [presenceByConversation, setPresenceByConversation] =
  useState<Record<ConversationId, UserPresence>>({
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

// ============================================================
// ធ្វើបច្ចុប្បន្នភាពវត្តមាន
// ធ្វើបច្ចុប្បន្នភាពវត្តមានរបស់ការសន្ទនាដែលបានជ្រើស។
// ពេលចេញក្រៅបណ្តាញ បង្កើតពេលឃើញចុងក្រោយថ្មី។
// ============================================================
const handlePresenceChange = (
  status: UserPresence["status"],
  lastSeen?: string,
) => {
  const currentLastSeen =
    lastSeen ??
    new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const lastSeenAt =
  status === "offline"
    ? Date.now()
    : undefined;

  setPresenceByConversation((currentPresence) => ({
    ...currentPresence,
    [selectedConversationId]: {
  status,
  ...(status === "offline"
    ? {
        lastSeen: currentLastSeen,
        lastSeenAt,
      }
    : {}),
},
  }));
};

// ============================================================
// ចំនួនសារមិនទាន់អាន
// ចំនួនសារមិនទាន់អានដំបូងសម្រាប់ការសន្ទនានីមួយៗ។
// ============================================================
const [unreadCounts, setUnreadCounts] = useState<
  Record<string, number>
>({
  sopheak: 2,
  "development-team": 5,
});


  /* ==========================================================
     ស្ថានភាពកំពុងវាយ
     ========================================================== */

  const [
    isTyping,
    setIsTyping,
  ] = useState(false);

  // ============================================================
// LOAD MESSAGES FROM BACKEND API
// ទាញយក messages របស់ conversation ពី Backend API.
// ============================================================
const loadMessages = async (
  conversationId: ConversationId,
) => {
  try {
    const response = await fetch(
      `/api/conversations/${conversationId}/messages`,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.message || "Failed to load messages",
      );
    }

    const result = await response.json();

    const apiMessages = result.data as Message[];

    setMessagesByConversation((currentMessages) => ({
      ...currentMessages,
      [conversationId]: apiMessages,
    }));
  } catch (error) {
    console.error(
      "Failed to load messages:",
      error,
    );
  }
};

// ============================================================
// SELECT CONVERSATION
// ជ្រើស conversation និងទាញ messages ពី Backend API.
// ============================================================
const handleSelectConversation = async (
  conversationId: ConversationId,
) => {
  // ----------------------------------------------------------
  // 1. Update active conversation
  // ----------------------------------------------------------
  setSelectedConversationId(conversationId);

  // ----------------------------------------------------------
  // 2. Load messages from Backend API
  // ----------------------------------------------------------
  await loadMessages(conversationId);

  // ----------------------------------------------------------
  // 3. Mark conversation as read
  // ----------------------------------------------------------
  markConversationAsRead(conversationId);

  // ----------------------------------------------------------
  // 4. Debug information
  // ----------------------------------------------------------
  console.log(
    "Selected conversation:",
    conversationId,
    "Presence:",
    presenceByConversation[conversationId],
  );

  // ----------------------------------------------------------
  // 5. Reset unread count
  // ----------------------------------------------------------
  setUnreadCounts((currentCounts) => ({
    ...currentCounts,
    [conversationId]: 0,
  }));

  // ----------------------------------------------------------
  // 6. Open mobile chat
  // ----------------------------------------------------------
  setShowMobileChat(true);

  // ----------------------------------------------------------
  // 7. Stop typing indicator
  // ----------------------------------------------------------
  setIsTyping(false);
};

// ============================================================
// HANDLE MOBILE BACK
// ត្រឡប់ពី Chat screen ទៅ Conversation List លើ Mobile.
// ============================================================
const handleMobileBack = () => {
  setShowMobileChat(false);
  setIsTyping(false);
};


  // ============================================================
// ធ្វើបច្ចុប្បន្នភាពស្ថានភាពសារ
// ក្លែងធ្វើដំណាក់កាលនៃការបញ្ជូនសារ។
// ពេលក្រោយ វានឹងត្រូវជំនួសដោយព្រឹត្តិការណ៍ពេលវេលាពិត។
// ============================================================
const updateMessageStatus = (
  conversationId: ConversationId,
  messageId: string,
  status: Message["status"],
) => {
  setMessagesByConversation((currentMessages) => ({
    ...currentMessages,

    [conversationId]: (
      currentMessages[conversationId] ?? []
    ).map((message) =>
      message.id === messageId
        ? {
            ...message,
            status,
          }
        : message,
    ),
  }));
};

   // ============================================================
// MARK CONVERSATION AS READ
// Marks all messages sent by the current user as read.
// Later this will be triggered by realtime read receipts.
// ============================================================
const markConversationAsRead = (
  conversationId: ConversationId,
) => {
  setMessagesByConversation((currentMessages) => ({
    ...currentMessages,

    [conversationId]: (
      currentMessages[conversationId] ?? []
    ).map((message) =>
      message.sender === "me"
        ? {
            ...message,
            status: "read",
          }
        : message,
    ),
  }));
};

/* ==========================================================
 * ផ្ញើសារ
 * ========================================================== */

/**
 * ផ្ញើសារថ្មីទៅ Backend API
 *
 * Flow:
 * 1. Validate message text
 * 2. POST message ទៅ Backend
 * 3. ទទួល message ដែល Backend បង្កើត
 * 4. រក្សា replyTo ពី Frontend
 * 5. បញ្ចូល message ទៅ conversation state
 * 6. Update delivered/read status
 */
const handleSendMessage = async (
  text: string,
  replyTo?: Message["replyTo"],
) => {
  const trimmedText = text.trim();

  // ----------------------------------------------------------
  // 1. Validate message
  // ----------------------------------------------------------
  if (!trimmedText) {
    return;
  }

  try {
    // --------------------------------------------------------
    // 2. Send message to Backend API
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // 3. Handle API error
    // --------------------------------------------------------
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      throw new Error(
        errorData?.message ||
          "Failed to send message",
      );
    }

    // --------------------------------------------------------
    // 4. Get message created by Backend
    // --------------------------------------------------------
    const result = await response.json();

    const apiMessage = result.data as Message;

    // --------------------------------------------------------
    // 5. Keep reply reference from Frontend
    // --------------------------------------------------------
    const newMessage: Message = {
      ...apiMessage,

      ...(replyTo
        ? {
            replyTo,
          }
        : {}),
    };

    // --------------------------------------------------------
    // 6. Add message to current conversation
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // 7. Simulate delivered status
    // --------------------------------------------------------
    setTimeout(() => {
      updateMessageStatus(
        selectedConversationId,
        newMessage.id,
        "delivered",
      );
    }, 700);

    // --------------------------------------------------------
    // 8. Simulate read status
    // --------------------------------------------------------
    setTimeout(() => {
      updateMessageStatus(
        selectedConversationId,
        newMessage.id,
        "read",
      );
    }, 1500);
  } catch (error) {
    console.error(
      "Failed to send message:",
      error,
    );
  }
};

// ============================================================
// HANDLE INCOMING MESSAGE
// Local simulation for incoming messages.
// ============================================================
const handleIncomingMessage = (
  conversationId: ConversationId,
  message: Message,
) => {
  // Add the incoming message to the conversation.
  setMessagesByConversation((currentMessages) => ({
    ...currentMessages,

    [conversationId]: [
      ...(currentMessages[conversationId] ?? []),
      message,
    ],
  }));

  // If the user is currently viewing this conversation,
  // do not increase the unread count.
  if (conversationId === selectedConversationId) {
    return;
  }

  // Increase unread count for another conversation.
  setUnreadCounts((currentCounts) => ({
    ...currentCounts,

    [conversationId]:
      (currentCounts[conversationId] ?? 0) + 1,
  }));
};


/* ==========================================================
 * កែសម្រួលសារ
 * ========================================================== */

/**
 * ធ្វើបច្ចុប្បន្នភាពសារដែលមានស្រាប់ក្នុងការសន្ទនាបច្ចុប្បន្ន។
 *
 * ផ្លាស់ប្ដូរតែអត្ថបទសារ។
 * លក្ខណៈសម្បត្តិសារផ្សេងទៀតនៅដដែល។
 */
const handleEditMessage = (
  messageId: string,
  text: string,
) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

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
              message.id === messageId
                ? {
                    ...message,
                    text: trimmedText,
                  }
                : message,
          ),
      };

      
    },
  );
};

  // ============================================================
// លុបសារ
// ដកសារដែលបានជ្រើសចេញពីការសន្ទនាបច្ចុប្បន្ន។
// ============================================================
const handleDeleteMessage = (
  messageId: string,
) => {
  setMessagesByConversation(currentMessages => {
    const currentConversationMessages =
      currentMessages[selectedConversationId] ?? [];

    return {
      ...currentMessages,
      [selectedConversationId]:
        currentConversationMessages.filter(
          message => message.id !== messageId,
        ),
    };
  });
};



  /* ==========================================================
     សារបច្ចុប្បន្ន
     ========================================================== */

  const currentMessages =
    messagesByConversation[
      selectedConversationId
    ] ?? [];

    // ============================================================
// LAST MESSAGE PREVIEW
// Builds conversation previews from the latest message.
// ============================================================
const lastMessagePreviewByConversation: Record<
  ConversationId,
  string
> = Object.fromEntries(
  Object.entries(messagesByConversation).map(
    ([conversationId, messages]) => {
      const lastMessage =
        messages[messages.length - 1];

      return [
        conversationId,
        lastMessage?.text ?? "",
      ];
    },
  ),
) as Record<ConversationId, string>;

// ============================================================
// LAST MESSAGE TIME
// Gets the display time from the latest message.
// ============================================================
const lastMessageTimeByConversation: Record<
  ConversationId,
  string
> = Object.fromEntries(
  Object.entries(messagesByConversation).map(
    ([conversationId, messages]) => {
      const lastMessage =
        messages[messages.length - 1];

      return [
        conversationId,
        lastMessage?.time ?? "",
      ];
    },
  ),
) as Record<ConversationId, string>;

    // ============================================================
// ព័ត៌មានការសន្ទនាសកម្ម
// ផ្ដល់ឈ្មោះការសន្ទនាដែលបានជ្រើសទៅផ្ទាំងខាងស្តាំ។
// ============================================================
const conversationNames: Record<ConversationId, string> = {
  sopheak: "Sopheak",
  dara: "Dara",
  vanna: "Vanna",
  "development-team": "ក្រុមអភិវឌ្ឍន៍",
  family: "គ្រួសារ",
};

const activeConversationName =
  conversationNames[selectedConversationId] ?? "ការសន្ទនា";
  


  /* ==========================================================
     បង្ហាញ
     ========================================================== */

  return (
    <AppShell
  sidebar={<Sidebar />}
  rightPanel={
    <RightPanel
      conversationName={activeConversationName}
      presence={
        presenceByConversation[selectedConversationId]
      }
      lastSeenText={formatLastSeen(
    presenceByConversation[selectedConversationId]?.lastSeenAt,
  )}
      onPresenceChange={handlePresenceChange}
    />
  }
>

      {/* ======================================================
         មាតិកាសម្រាប់កុំព្យូទ័រ / ថេប្លេត
         ====================================================== */}

      <div className="flex min-h-0 min-w-0 flex-1">

        {/* ====================================================
           បញ្ជីការសន្ទនា
           ==================================================== */}

        <div
          className={
            showMobileChat
              ? "hidden md:flex"
              : "flex"
          }
        >
          <ConversationList
            selectedConversationId={
              selectedConversationId
            }
            onSelectConversation={
              handleSelectConversation
            }
            unreadCounts={unreadCounts}
            lastMessagePreviewByConversation={
              lastMessagePreviewByConversation
            }
            lastMessageTimeByConversation={
            lastMessageTimeByConversation
          }
          />
        </div>


        {/* ====================================================
           ការជជែកលើកុំព្យូទ័រ / ថេប្លេត
           ==================================================== */}

        <div className="hidden min-w-0 flex-1 flex-col md:flex">

          <div className="min-h-0 flex-1">

             <ChatArea
  conversationId={
    selectedConversationId
  }
  messages={currentMessages}
  presence={
  presenceByConversation[selectedConversationId]
}
  isTyping={isTyping}
  onSendMessage={
    handleSendMessage
  }
  onEditMessage={handleEditMessage}
  onDeleteMessage={handleDeleteMessage}
  onTypingChange={
    setIsTyping
  }
/>

          </div>

        </div>

      </div>


      {/* ======================================================
         អេក្រង់ជជែកលើទូរស័ព្ទ
         ====================================================== */}

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


          {/* ==================================================
             មាតិកាជជែកលើទូរស័ព្ទ
             ================================================== */}

          <div className="min-h-0 flex-1">

              <ChatArea
  conversationId={
    selectedConversationId
  }
  messages={currentMessages}
  presence={
  presenceByConversation[selectedConversationId]
}
  isTyping={isTyping}
  onBack={handleMobileBack}
  onSendMessage={
    handleSendMessage
  }
  onEditMessage={handleEditMessage}
  onDeleteMessage={handleDeleteMessage}
  onTypingChange={
    setIsTyping
  }
/>


          </div>

 

        </div>
      )}

    </AppShell>
  );
}
