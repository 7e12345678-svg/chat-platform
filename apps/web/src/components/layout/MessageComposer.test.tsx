import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MessageComposer } from "./MessageComposer";

describe("MessageComposer", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("opens an image file input from the attachment button", () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => {});

    render(
      <MessageComposer
        onSendMessage={vi.fn()}
      />,
    );

    const attachmentButton = screen.getByRole(
      "button",
      { name: "Attach file" },
    );

    const fileInput =
      screen.getByLabelText("Attach image");

    expect(fileInput.getAttribute("type")).toBe(
      "file",
    );

    expect(
      fileInput.getAttribute("accept"),
    ).toBe(
      "image/jpeg,image/png,image/webp,image/gif",
    );

    expect(
      fileInput.classList.contains("sr-only"),
    ).toBe(true);

    fireEvent.click(attachmentButton);

    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });

  it("clears the typing timer when unmounted", () => {
    vi.useFakeTimers();

    const onTypingChange = vi.fn();

    const { unmount } = render(
      <MessageComposer
        onSendMessage={vi.fn()}
        onTypingChange={onTypingChange}
      />,
    );

    const textarea = screen.getByRole(
      "textbox",
      { name: "Message" },
    );

    fireEvent.change(textarea, {
      target: { value: "Hello" },
    });

    expect(
      onTypingChange,
    ).toHaveBeenCalledWith(true);

    onTypingChange.mockClear();

    unmount();

    vi.advanceTimersByTime(1500);

    expect(
      onTypingChange,
    ).not.toHaveBeenCalledWith(false);
  });

  it("stops typing after 1500ms of inactivity", () => {
    vi.useFakeTimers();

    const onTypingChange = vi.fn();

    render(
      <MessageComposer
        onSendMessage={vi.fn()}
        onTypingChange={onTypingChange}
      />,
    );

    const textarea = screen.getByRole(
      "textbox",
      { name: "Message" },
    );

    fireEvent.change(textarea, {
      target: { value: "Hello" },
    });

    expect(
      onTypingChange,
    ).toHaveBeenCalledWith(true);

    onTypingChange.mockClear();

    vi.advanceTimersByTime(1499);

    expect(
      onTypingChange,
    ).not.toHaveBeenCalledWith(false);

    vi.advanceTimersByTime(1);

    expect(
      onTypingChange,
    ).toHaveBeenCalledWith(false);
  });

  it("notifies the parent when an image is selected", () => {
    const onSelectFile = vi.fn();

    render(
      <MessageComposer
        onSendMessage={vi.fn()}
        onSelectFile={onSelectFile}
      />,
    );

    const fileInput = screen.getByLabelText(
      "Attach image",
    );

    const file = new File(
      ["image-data"],
      "photo.png",
      { type: "image/png" },
    );

    Object.defineProperty(fileInput, "files", {
      value: [file],
      configurable: true,
    });

    fireEvent.change(fileInput);

    expect(onSelectFile).toHaveBeenCalledWith(file);
  });
});
