# Messdisgram Mobile MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an authenticated, mobile-first, real-time direct-message application that replaces the current local sample chat state.

**Architecture:** Keep the existing Next.js app as the presentation layer. Use Supabase Auth for email/password sessions, PostgreSQL plus RLS for chat data, Storage for private image uploads, and Realtime Presence/Broadcast plus Postgres changes for live chat updates. Page-level containers load and coordinate data; layout components receive narrow typed props and contain no Supabase calls.

**Tech Stack:** Next.js 16.3.4 App Router, React 19.2.8, TypeScript strict mode, Tailwind CSS 4, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Zod, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-14-messdisgram-mobile-mvp-design.md`

## Global Constraints

- Target phones first; the chat detail view must replace the chat list below the `md` breakpoint and have a working back action.
- Login is email/password only; do not implement OAuth, group chats, communities, calls, or push notifications.
- Preserve existing user-authored UI work unless a change is required to connect it to live data.
- Enable RLS on every database table and never expose Supabase service-role credentials to browser code.
- Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser-safe configuration; do not commit actual `.env.local` values.
- Text messages may be 1–4,000 characters after trimming. Image messages accept JPEG, PNG, WebP, or GIF files no larger than 10 MB.
- A message must have nonempty text, an image, or both.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `apps/web/src/lib/env.ts` | Validate public Supabase configuration once. |
| `apps/web/src/lib/supabase/client.ts` | Browser Supabase client. |
| `apps/web/src/lib/supabase/server.ts` | Request-scoped Server Component/Action client. |
| `apps/web/src/proxy.ts` | Refresh auth cookies and redirect unauthenticated protected routes. |
| `apps/web/src/lib/chat/types.ts` | UI-safe profile, conversation, message, and presence types. |
| `apps/web/src/lib/chat/validation.ts` | Zod schemas for auth, messages, and uploads. |
| `apps/web/src/lib/chat/repository.ts` | Authenticated data reads and mutations. |
| `apps/web/src/lib/chat/realtime.ts` | Typed channel names and subscription helpers. |
| `apps/web/src/app/(auth)/login/page.tsx` | Sign-in screen. |
| `apps/web/src/app/(auth)/register/page.tsx` | Account creation screen. |
| `apps/web/src/app/page.tsx` | Authenticated chat home route. |
| `apps/web/src/app/actions/chat.ts` | Server actions for chat mutations. |
| `apps/web/src/components/auth/AuthForm.tsx` | Shared email/password form. |
| `apps/web/src/components/chat/ChatApp.tsx` | Client state container for chat list/detail, optimistic sends, and subscriptions. |
| `apps/web/src/components/chat/NewConversationDialog.tsx` | Debounced user search and direct-chat creation. |
| `apps/web/src/components/layout/ConversationList.tsx` | Render real conversation summaries. |
| `apps/web/src/components/layout/ChatArea.tsx` | Render persisted messages and message actions. |
| `apps/web/src/components/layout/MessageComposer.tsx` | Text/image composing, typing debounce cleanup, and send state. |
| `apps/web/supabase/migrations/202609140001_initial_chat.sql` | Schema, indexes, functions, Storage policy, RLS, and Realtime publication. |
| `apps/web/src/**/__tests__/*.test.ts(x)` | Unit/component tests. |
| `apps/web/vitest.config.mts`, `apps/web/src/test/setup.ts` | Test runner configuration and browser matchers. |

## Task 1: Establish safe configuration, tests, and shared domain types

**Files:**
- Modify: `apps/web/package.json`, `apps/web/tsconfig.json`, `pnpm-lock.yaml`, `.gitignore`
- Create: `apps/web/.env.example`, `apps/web/vitest.config.mts`, `apps/web/src/test/setup.ts`, `apps/web/src/lib/env.ts`, `apps/web/src/lib/chat/types.ts`, `apps/web/src/lib/chat/validation.ts`, `apps/web/src/lib/chat/__tests__/validation.test.ts`

**Interfaces:**
- Produces `MessageInputSchema`, `ImageUploadSchema`, `LoginSchema`, `RegisterSchema` and their inferred TypeScript types.
- Produces `ChatMessage`, `ConversationSummary`, `Profile`, and `DirectConversation` types used by all UI and repository tasks.

- [ ] **Step 1: Add test and validation dependencies.**

Run:

```bash
pnpm --filter web add @supabase/ssr @supabase/supabase-js zod
pnpm --filter web add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Write failing validation tests.**

```ts
it("rejects a blank message with no image", () => {
  expect(MessageInputSchema.safeParse({ content: "   ", imageUrl: null }).success).toBe(false);
});

it("accepts an image-only message", () => {
  expect(MessageInputSchema.safeParse({ content: "", imageUrl: "uploads/u1/a.png" }).success).toBe(true);
});
```

- [ ] **Step 3: Run the focused test and verify it fails because the schema is absent.**

Run: `pnpm --filter web vitest run src/lib/chat/__tests__/validation.test.ts`

Expected: FAIL with an import/module error.

- [ ] **Step 4: Implement schemas, types, env validation, and test setup.**

```ts
export const MessageInputSchema = z.object({
  content: z.string().trim().max(4000),
  imageUrl: z.string().min(1).nullable(),
}).refine(({ content, imageUrl }) => content.length > 0 || imageUrl !== null, {
  message: "A message needs text or an image.",
});

export type ChatMessage = {
  id: string; conversationId: string; senderId: string; content: string;
  imageUrl: string | null; replyToId: string | null; createdAt: string;
  editedAt: string | null; deletedAt: string | null;
};
```

Configure Vitest with `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]`, and the `@` alias. Add `test` and `test:watch` scripts. Put only variable names—not secrets—in `.env.example`.

- [ ] **Step 5: Run validation and lint checks.**

Run: `pnpm --filter web test -- --run src/lib/chat/__tests__/validation.test.ts && pnpm --filter web lint`

Expected: PASS with no lint errors.

- [ ] **Step 6: Commit the completed foundation.**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/.env.example apps/web/vitest.config.mts apps/web/src/test apps/web/src/lib pnpm-lock.yaml .gitignore
git commit -m "chore: add chat app foundation"
```

## Task 2: Create the secured Supabase schema

**Files:**
- Create: `apps/web/supabase/migrations/202609140001_initial_chat.sql`, `apps/web/supabase/seed.sql`, `apps/web/src/lib/chat/__tests__/schema-contract.test.ts`

**Interfaces:**
- Produces tables `profiles`, `conversations`, `conversation_members`, and `messages`.
- Produces `create_direct_conversation(target_profile_id uuid) returns uuid` for Task 5.

- [ ] **Step 1: Write a failing schema-contract test that reads the migration.**

```ts
it("enables RLS and creates the direct conversation function", async () => {
  const sql = await readFile(migrationPath, "utf8");
  expect(sql).toContain("alter table public.messages enable row level security");
  expect(sql).toContain("create or replace function public.create_direct_conversation");
});
```

- [ ] **Step 2: Run the contract test and verify it fails.**

Run: `pnpm --filter web vitest run src/lib/chat/__tests__/schema-contract.test.ts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Write migration SQL.**

The migration must create UUID-keyed tables, foreign keys, `created_at` timestamps, a unique `(conversation_id, profile_id)` membership key, message indexes on `(conversation_id, created_at)`, and an insert trigger that creates a profile for `auth.users`.

Implement `create_direct_conversation` as `security definer`, set a safe search path, reject self-chat, reuse an existing direct conversation with exactly the caller and target as members, otherwise create one conversation and two memberships. Add policies that restrict all conversation, membership, message, and private Storage access to members. Add `messages` to `supabase_realtime` publication.

- [ ] **Step 4: Run the schema contract and local database verification.**

Run:

```bash
pnpm --filter web vitest run src/lib/chat/__tests__/schema-contract.test.ts
supabase db reset --workdir apps/web
```

Expected: contract test passes and Supabase applies migration without SQL errors.

- [ ] **Step 5: Commit schema work.**

```bash
git add apps/web/supabase apps/web/src/lib/chat/__tests__/schema-contract.test.ts
git commit -m "feat: add secured chat schema"
```

## Task 3: Add Supabase clients and email/password authentication

**Files:**
- Create: `apps/web/src/lib/supabase/client.ts`, `apps/web/src/lib/supabase/server.ts`, `apps/web/src/proxy.ts`, `apps/web/src/app/(auth)/actions.ts`, `apps/web/src/app/(auth)/login/page.tsx`, `apps/web/src/app/(auth)/register/page.tsx`, `apps/web/src/components/auth/AuthForm.tsx`, `apps/web/src/components/auth/__tests__/AuthForm.test.tsx`
- Modify: `apps/web/src/app/page.tsx`, `apps/web/src/app/layout.tsx`

**Interfaces:**
- Produces `signIn(formData: FormData): Promise<AuthActionState>` and `signUp(formData: FormData): Promise<AuthActionState>`.
- Produces `createBrowserClient()` and `createServerClient()`.

- [ ] **Step 1: Write failing authentication form tests.**

```tsx
it("blocks registration until valid email, username, and password are entered", async () => {
  render(<AuthForm mode="register" action={vi.fn()} />);
  await userEvent.click(screen.getByRole("button", { name: /create account/i }));
  expect(await screen.findByText(/valid email/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and verify it fails.**

Run: `pnpm --filter web vitest run src/components/auth/__tests__/AuthForm.test.tsx`

Expected: FAIL because `AuthForm` is absent.

- [ ] **Step 3: Implement auth clients, server actions, forms, and route protection.**

Use `@supabase/ssr` cookie adapters in the browser/server clients. Server actions validate input with Task 1 schemas, call `auth.signInWithPassword` or `auth.signUp`, return generic sign-in failure text, and redirect a successful session to `/`. The Next.js 16 `proxy.ts` refreshes sessions and redirects unauthenticated users from `/` to `/login`; it redirects authenticated users away from `/login` and `/register`.

- [ ] **Step 4: Run form tests, lint, and production build.**

Run: `pnpm --filter web test -- --run src/components/auth/__tests__/AuthForm.test.tsx && pnpm --filter web lint && pnpm --filter web build`

Expected: PASS.

- [ ] **Step 5: Commit authentication.**

```bash
git add apps/web/src/app apps/web/src/components/auth apps/web/src/lib/supabase apps/web/src/proxy.ts
git commit -m "feat: add email password authentication"
```

## Task 4: Implement direct-conversation data access and user search

**Files:**
- Create: `apps/web/src/lib/chat/repository.ts`, `apps/web/src/app/actions/chat.ts`, `apps/web/src/components/chat/NewConversationDialog.tsx`, `apps/web/src/lib/chat/__tests__/repository.test.ts`, `apps/web/src/components/chat/__tests__/NewConversationDialog.test.tsx`

**Interfaces:**
- Produces `listConversations(): Promise<ConversationSummary[]>`, `searchProfiles(query: string): Promise<Profile[]>`, and `startDirectConversation(profileId: string): Promise<string>`.
- Consumes the database function from Task 2 and authenticated server client from Task 3.

- [ ] **Step 1: Write failing tests for minimum query length and direct-chat creation.**

```ts
it("does not search for fewer than two characters", async () => {
  await expect(searchProfiles("a")).resolves.toEqual([]);
});

it("returns the conversation id supplied by create_direct_conversation", async () => {
  expect(await startDirectConversation("target-id")).toBe("conversation-id");
});
```

- [ ] **Step 2: Run focused tests and verify failure.**

Run: `pnpm --filter web vitest run src/lib/chat/__tests__/repository.test.ts src/components/chat/__tests__/NewConversationDialog.test.tsx`

Expected: FAIL because repository and dialog do not exist.

- [ ] **Step 3: Implement repository and dialog.**

`listConversations` selects only conversations containing the authenticated user, includes the other member's profile and latest non-deleted message, and sorts by last message time. `searchProfiles` excludes the current profile, limits results to 20, and searches username/display name case-insensitively. The dialog debounces at 250 ms and invokes a Server Action that calls `startDirectConversation` then navigates to the returned conversation.

- [ ] **Step 4: Run all Task 4 tests and lint.**

Run: `pnpm --filter web test -- --run src/lib/chat/__tests__/repository.test.ts src/components/chat/__tests__/NewConversationDialog.test.tsx && pnpm --filter web lint`

Expected: PASS.

- [ ] **Step 5: Commit direct-chat discovery.**

```bash
git add apps/web/src/lib/chat/repository.ts apps/web/src/app/actions/chat.ts apps/web/src/components/chat/NewConversationDialog.tsx apps/web/src/lib/chat/__tests__ apps/web/src/components/chat/__tests__
git commit -m "feat: add user search and direct chats"
```

## Task 5: Persist messages, images, and real-time state

**Files:**
- Create: `apps/web/src/lib/chat/realtime.ts`, `apps/web/src/components/chat/useConversationRealtime.ts`, `apps/web/src/components/chat/__tests__/useConversationRealtime.test.tsx`
- Modify: `apps/web/src/lib/chat/repository.ts`, `apps/web/src/app/actions/chat.ts`

**Interfaces:**
- Produces `sendMessage(input: { conversationId: string; content: string; image: File | null; replyToId: string | null }): Promise<ChatMessage>`.
- Produces `updateMessage(messageId: string, content: string): Promise<void>` and `deleteMessage(messageId: string): Promise<void>`.
- Produces `useConversationRealtime({ conversationId, currentUserId, onMessage, onTyping, onPresence })`.

- [ ] **Step 1: Write failing tests for typing cleanup and upload validation.**

```tsx
it("sends typing false when its subscription unmounts", () => {
  const { unmount } = renderHook(() => useConversationRealtime(options));
  unmount();
  expect(channel.send).toHaveBeenCalledWith(expect.objectContaining({ event: "typing", payload: { isTyping: false } }));
});

it("rejects an 11 MB image before starting upload", async () => {
  await expect(sendMessage({ ...input, image: new File([new Uint8Array(11_000_000)], "large.png", { type: "image/png" }) })).rejects.toThrow(/10 MB/);
});
```

- [ ] **Step 2: Run tests and verify failure.**

Run: `pnpm --filter web vitest run src/components/chat/__tests__/useConversationRealtime.test.tsx`

Expected: FAIL because the hook is absent.

- [ ] **Step 3: Implement validated message mutation and subscriptions.**

Validate text/image before any network write. Upload valid images to `message-images/{currentUserId}/{crypto.randomUUID()}-{sanitizedName}`, get a controlled URL, and insert the message only after upload succeeds. Soft-delete by setting `deleted_at`; edit only `content` and `edited_at`. Subscribe to Postgres `INSERT`, `UPDATE`, and `DELETE` payloads for the active conversation; use a private broadcast channel for `{ userId, isTyping }` and Presence for online state. Remove all listeners and broadcast typing false in cleanup.

- [ ] **Step 4: Run Task 5 tests and build.**

Run: `pnpm --filter web test -- --run src/components/chat/__tests__/useConversationRealtime.test.tsx && pnpm --filter web build`

Expected: PASS.

- [ ] **Step 5: Commit real-time messaging.**

```bash
git add apps/web/src/lib/chat apps/web/src/app/actions/chat.ts apps/web/src/components/chat
git commit -m "feat: add realtime direct messages"
```

## Task 6: Connect the mobile chat UI to live data

**Files:**
- Create: `apps/web/src/components/chat/ChatApp.tsx`, `apps/web/src/components/chat/__tests__/ChatApp.test.tsx`
- Modify: `apps/web/src/app/page.tsx`, `apps/web/src/components/layout/ConversationList.tsx`, `apps/web/src/components/layout/ChatArea.tsx`, `apps/web/src/components/layout/MessageComposer.tsx`, `apps/web/src/components/layout/Sidebar.tsx`, `apps/web/src/components/layout/RightPanel.tsx`

**Interfaces:**
- Consumes `ConversationSummary`, `ChatMessage`, Task 4 discovery actions, and Task 5 mutation/subscription APIs.
- Produces an authenticated mobile chat screen with no seeded message data.

- [ ] **Step 1: Write failing mobile integration tests.**

```tsx
it("opens a selected chat on mobile and returns to the chat list", async () => {
  render(<ChatApp initialConversations={conversations} currentUser={user} />);
  await userEvent.click(screen.getByRole("button", { name: /sopheak/i }));
  expect(screen.getByRole("button", { name: /back to chats/i })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: /back to chats/i }));
  expect(screen.getByRole("heading", { name: /chats/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the component test and verify failure.**

Run: `pnpm --filter web vitest run src/components/chat/__tests__/ChatApp.test.tsx`

Expected: FAIL because `ChatApp` is absent.

- [ ] **Step 3: Implement the live container and focused component refactor.**

Make the authenticated page load the current user and initial conversation summaries on the server, then render `ChatApp`. Remove `initialMessages`, simulated incoming messages, fake delivery timeouts, hard-coded presence, and hard-coded conversation names from `page.tsx`. `ChatApp` owns the active conversation, mobile back state, optimistic message entries, and the Task 5 subscription. Pass real users/conversations into `ConversationList`, display uploaded images and deleted-message text in `ChatArea`, and pass a file-selection callback to `MessageComposer`.

Fix `MessageComposer` by using one `handleChange` handler, resetting its typing timer on every nonempty input, clearing it on send and unmount, and making the attachment button open a visually hidden `accept="image/jpeg,image/png,image/webp,image/gif"` input. Use `px-4 py-2.5` outer composer padding as previously requested.

- [ ] **Step 4: Run UI tests, lint, and build.**

Run: `pnpm --filter web test -- --run src/components/chat/__tests__/ChatApp.test.tsx && pnpm --filter web lint && pnpm --filter web build`

Expected: PASS.

- [ ] **Step 5: Commit the integrated chat experience.**

```bash
git add apps/web/src/app/page.tsx apps/web/src/components/chat apps/web/src/components/layout
git commit -m "feat: connect mobile chat interface"
```

## Task 7: Verify security and mobile behavior

**Files:**
- Create: `apps/web/README.md` sections for Supabase setup and verification steps.
- Modify: any failing test or documentation file discovered by verification.

**Interfaces:**
- Consumes the complete implementation from Tasks 1–6.
- Produces reproducible setup and verification instructions.

- [ ] **Step 1: Add the local setup instructions.**

Document creating a Supabase project, setting `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `apps/web/.env.local`, applying the migration, creating the `message-images` bucket, enabling email/password auth, and starting with `pnpm dev` from the repository root.

- [ ] **Step 2: Run the complete automated suite.**

Run: `pnpm --filter web test -- --run && pnpm --filter web lint && pnpm --filter web build`

Expected: all tests, lint, and production build pass.

- [ ] **Step 3: Perform the two-user manual acceptance pass.**

1. Register User A and User B with separate email addresses.
2. From User A, find User B and open a direct conversation.
3. Send text, emoji, image-only, and reply messages; confirm User B receives them without refresh.
4. Confirm typing and presence appear then clear when typing stops, sending occurs, or the tab closes.
5. Confirm User B cannot edit/delete User A’s message; confirm User A can edit/delete their own.
6. At a 390 px viewport, confirm the chat list, conversation navigation, back button, message composer, and keyboard-safe bottom padding work.

- [ ] **Step 4: Commit documentation and any verification-only fixes.**

```bash
git add apps/web/README.md apps/web/src apps/web/supabase
git commit -m "docs: add chat platform setup guide"
```
