"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

/* ============================================================
 * TYPES
 * ============================================================ */

export interface MessageComposerProps {
  onSendMessage: (message: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  onSelectFile?: (file: File) => void;
}

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const MIN_TEXTAREA_HEIGHT = 44;
const MAX_TEXTAREA_HEIGHT = 140;

const emojis = [
  "😀",
  "😂",
  "😍",
  "👍",
  "❤️",
  "🎉",
  "🔥",
  "🙏",
  "🫢",
  "😞",
  "💋",
  "🙁",
  "😏",
  "👀",
  "👽",
  "🥶",
  "🤯",
  "😱",
  "😴",
  "🤩",
  "🫶🏻",
  "🙀",
  "😽",
  "🫩",
  "🙄",
  "😯",
  "🩷",
  "🧡",
  "💛",
  "💚",
  "🩵",
  "💙",
  "💜",
  "🖤",
  "🩶",
  "🤍",
  "🤎",
  "💔",
  "❤️‍🔥",
  "❤️‍🩹",
  "💞",
  "💗",
  "💖",
  "😹",
  "🥺",
  "🌱",
  "🌿",
  "☘️",
  "🍀",
  "💧",
  "🌨",
  "⛈",
  "🌏",
];

/* ============================================================
 * COMPONENT
 * ============================================================ */

export function MessageComposer({
  onSendMessage,
  onTypingChange,
  onSelectFile,
}: MessageComposerProps) {
  /* ----------------------------------------------------------
   * STATE
   * ---------------------------------------------------------- */

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  /* ----------------------------------------------------------
   * REFS
   * ---------------------------------------------------------- */

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /* ----------------------------------------------------------
   * AUTO-GROW TEXTAREA
   * ---------------------------------------------------------- */

  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";

    const nextHeight = Math.min(
      Math.max(textarea.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    );

    textarea.style.height = `${nextHeight}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  };

  /* ----------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------- */

  const handleSend = () => {
    const trimmedMessage = message.trim();

    // Prevent empty messages.
    if (!trimmedMessage) {
      return;
    }

    // Send message to parent component.
    onSendMessage(trimmedMessage);

    // Reset composer after sending.
    setMessage("");
    setShowEmojiPicker(false);

    // Clear the pending typing timer.
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Stop typing state.
    onTypingChange?.(false);
  };

  /* ----------------------------------------------------------
   * FILE CHANGE
   * ---------------------------------------------------------- */

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onSelectFile?.(file);

    // Reset input so the same file can be selected again.
    event.target.value = "";
  };

  /* ----------------------------------------------------------
   * INPUT CHANGE
   * ---------------------------------------------------------- */

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;

    setMessage(value);

    if (value.trim()) {
      // User is typing.
      onTypingChange?.(true);

      // Reset the previous typing timer.
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 1500ms of inactivity.
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange?.(false);
        typingTimeoutRef.current = null;
      }, 1500);
    } else {
      // Empty input stops typing immediately.
      onTypingChange?.(false);

      // Cancel the existing timer.
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    resizeTextarea();
  };

  /* ----------------------------------------------------------
   * KEYBOARD HANDLER
   *
   * Enter       → Send
   * Shift+Enter → New line
   * ---------------------------------------------------------- */

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  /* ----------------------------------------------------------
   * ADD EMOJI
   * ---------------------------------------------------------- */

  const handleAddEmoji = (emoji: string) => {
    setMessage((current) => `${current}${emoji}`);
    setShowEmojiPicker(false);

    // Keep typing state active after adding emoji.
    onTypingChange?.(true);
  };

  /* ----------------------------------------------------------
   * RESET TEXTAREA HEIGHT
   * ---------------------------------------------------------- */

  useEffect(() => {
    resizeTextarea();
  }, [message]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, []);

  /* ==========================================================
   * RENDER
   * ========================================================== */

  return (
    <div className="shrink-0 border-t border-(--border) bg-(--surface) px-4 py-2.5 sm:px-4">
      <div className="flex items-end gap-2.5">
        {/* ----------------------------------------------------
         * ATTACHMENT BUTTON
         * ---------------------------------------------------- */}

        <button
          type="button"
          aria-label="Attach file"
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-xl
            text-(--text-secondary)
            transition-all
            duration-150
            hover:scale-105
            hover:bg-(--surface-hover)
            hover:text-(--text-primary)
            active:scale-95
          "
        >
          +
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          aria-label="Attach image"
          className="sr-only"
          onChange={handleFileChange}
        />

        {/* ----------------------------------------------------
         * MESSAGE INPUT WRAPPER
         * ---------------------------------------------------- */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-end
            rounded-2xl
            border
            border-(--border)
            bg-(--background)
            px-3
            py-2
            transition-colors
            focus-within:border-(--primary)
            focus-within:ring-2
            focus-within:ring-(--primary)/10
          "
        >
          {/* --------------------------------------------------
           * TEXTAREA
           * -------------------------------------------------- */}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            aria-label="Message"
            className="
              max-h-35
              min-h-11
              w-full
              resize-none
              bg-transparent
              py-2
              text-[14px]
              leading-6
              text-(--text-primary)
              outline-none
              placeholder:text-(--text-muted)
            "
          />

          {/* --------------------------------------------------
           * EMOJI BUTTON + PICKER
           * -------------------------------------------------- */}

          <div className="relative mb-1 ml-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((value) => !value)}
              aria-label="Add emoji"
              title="Add emoji"
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-lg
                text-(--text-secondary)
                transition-all
                duration-150
                hover:scale-105
                hover:bg-(--surface-hover)
                hover:text-(--text-primary)
                active:scale-95
              "
            >
              ☺
            </button>

            {/* ------------------------------------------------
             * EMOJI PICKER
             * ------------------------------------------------ */}

            {showEmojiPicker && (
              <div
                className="
                absolute
                bottom-11
                right-0
                z-50
                grid
                w-70
                grid-cols-8
                gap-1
                rounded-xl
                border
                border-(--border)
                bg-(--surface)
                p-3
                shadow-xl
                animate-in
                fade-in
                zoom-in-95
                slide-in-from-bottom-2
                duration-150
                "
              >

                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddEmoji(emoji)}
                    aria-label={`Add ${emoji}`}
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      text-lg
                      transition-all 
                      duration-150
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

        {/* ----------------------------------------------------
         * SEND BUTTON
         * ---------------------------------------------------- */}

        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
          aria-label="Send message"
          title="Send message"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-(--primary)
            text-lg
            text-white
            transition-all
            duration-200
            hover:-translate-y-px
            hover:brightness-110
            hover:shadow-md
            active:translate-y-0
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          ↑
        </button>
      </div>

      {/* ------------------------------------------------------
       * KEYBOARD HINT
       * ------------------------------------------------------ */}

      <div className="mt-2.5 hidden px-1 text-xs text-(--text-muted) sm:block">
        Enter to send · Shift + Enter for new line
      </div>
    </div>
  );
}
