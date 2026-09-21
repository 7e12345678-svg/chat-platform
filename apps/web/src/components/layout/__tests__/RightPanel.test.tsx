import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";


import { RightPanel } from "../RightPanel";

describe("RightPanel", () => {
  it("does not show temporary presence test controls", () => {
    render(
      <RightPanel
        conversationName="Sopheak"
        presence={{
          status: "online",
        }}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: /online/i,
      }),
    ).toBeNull();

    expect(
      screen.queryByRole("button", {
        name: /offline/i,
      }),
    ).toBeNull();

    expect(
      screen.queryByRole("button", {
        name: /last seen/i,
      }),
    ).toBeNull();
  });
});

 it("shows the current user as online when current user presence is online", () => {
  render(
    <RightPanel
      conversationName="Sopheak"
      presence={{ status: "online" }}
      currentUserPresence={{ status: "online" }}
    />,
  );

  const membersHeadings = screen.getAllByRole("heading", {
  name: /members/i,
});

const membersHeading = membersHeadings[membersHeadings.length - 1];

  const membersSection = membersHeading.closest("section");

  expect(membersSection).not.toBeNull();

  const members = within(membersSection!);

  expect(members.getByText("Y")).toBeTruthy();
  expect(members.getAllByText("Online").length).toBeGreaterThanOrEqual(2);
  expect(members.queryByText("Offline")).toBeNull();
});
