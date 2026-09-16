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
}

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const MIN_TEXTAREA_HEIGHT = 44;
const MAX_TEXTAREA_HEIGHT = 140;

const emojis = ["😀", "😂", "😍", "👍", "❤️", "🎉", "🔥", "🙏"];

/* ============================================================
 * COMPONENT
 * ============================================================ */

export function MessageComposer({
  onSendMessage,
  onTypingChange,
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

    // Stop typing state.
    onTypingChange?.(false);
  };

  /* ----------------------------------------------------------
   * INPUT CHANGE
   * ---------------------------------------------------------- */

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;

    setMessage(value);

    // Tell parent whether the user is currently typing.
    onTypingChange?.(value.trim().length > 0);

    resizeTextarea();
  };

  // ============================================================
// TYPING TIMER
// Automatically stops the typing indicator after
// the user has stopped typing for a short period.
// ============================================================
const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
  null,
);

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

  /* ==========================================================
   * RENDER
   * ========================================================== */

  return (
    <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 sm:px-4">
      <div className="flex items-end gap-2.5">
        {/* ----------------------------------------------------
         * ATTACHMENT BUTTON
         * ---------------------------------------------------- */}

        <button
          type="button"
          aria-label="Attach file"
          title="Attach file"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-xl
            text-[var(--text-secondary)]
            transition-all
            duration-150
            hover:scale-105
            hover:bg-[var(--surface-hover)]
            hover:text-[var(--text-primary)]
            active:scale-95
          "
        >
          +
        </button>

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
            border-[var(--border)]
            bg-[var(--background)]
            px-3
            py-2
            transition-colors
            focus-within:border-[var(--primary)]
            focus-within:ring-2
            focus-within:ring-[var(--primary)]/10
          "
        >
          {/* --------------------------------------------------
           * TEXTAREA
           * -------------------------------------------------- */}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => {
  const value = event.target.value;

  setMessage(value);

  // User is typing.
  if (value.trim()) {
    onTypingChange?.(true);

    // Reset the previous timer.
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 1.5 seconds.
    typingTimeoutRef.current = setTimeout(() => {
      onTypingChange?.(false);
    }, 1500);
  } else {
    // Empty input → stop typing immediately.
    onTypingChange?.(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }
}}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            aria-label="Message"
            className="
              max-h-[140px]
              min-h-[44px]
              w-full
              resize-none
              bg-transparent
              py-2
              text-[14px]
              leading-6
              text-[var(--text-primary)]
              outline-none
              placeholder:text-[var(--text-muted)]
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
                text-[var(--text-secondary)]
                transition-all
                duration-150
                hover:scale-105
                hover:bg-[var(--surface-hover)]
                hover:text-[var(--text-primary)]
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
                  grid-cols-4
                  gap-1
                  rounded-xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]
                  p-2
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
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      text-lg
                      transition-all 
                      duration-150
                      hover:scale-110
                      hover:bg-[var(--surface-hover)]
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
            bg-[var(--primary)]
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

      <div className="mt-2.5 hidden px-1 text-xs text-[var(--text-muted)] sm:block">
        Enter to send · Shift + Enter for new line
      </div>
    </div>
  );
}