# Messdisgram mobile-first MVP design

## Goal

Turn the existing Next.js chat interface into a functional, mobile-first direct-message application for general users. The first release prioritizes reliable private conversations; group chats, communities, calls, and Google sign-in remain later milestones.

## Product scope

The MVP provides:

- Account registration, sign-in, and sign-out with email and password.
- A user profile containing a username, display name, and optional avatar.
- User search and creation or reuse of a one-to-one conversation.
- Real-time text, emoji, and image messages.
- Reply, edit, and soft-delete for a sender's own messages.
- Typing and online/offline status.
- A mobile-first chat list and chat-detail flow, with a back action on small screens.
- The existing dark visual theme.

The MVP explicitly excludes group chat, communities/channels, voice or video calls, push notifications, and third-party OAuth.

## Architecture

The existing `apps/web` Next.js application remains the frontend. Supabase supplies the backend services:

- Supabase Auth owns email/password accounts and sessions.
- PostgreSQL stores profile, conversation, membership, and message records.
- Supabase Realtime delivers new/changed messages and transient presence events.
- Supabase Storage holds message image assets.

Client components fetch authenticated data through server-safe Supabase clients and subscribe only after the user is authenticated. UI state that is currently seeded with sample conversations moves behind data-access helpers, keeping presentational components such as `ChatArea` and `MessageComposer` focused on rendering and callbacks.

## Data model

### `profiles`

One row per authenticated user.

| Field | Purpose |
| --- | --- |
| `id` | Auth user UUID; primary key |
| `username` | Unique searchable handle |
| `display_name` | User-facing name |
| `avatar_url` | Optional image URL |
| `updated_at` | Last profile update |

### `conversations`

| Field | Purpose |
| --- | --- |
| `id` | Conversation UUID; primary key |
| `kind` | Starts as `direct`; supports future extension |
| `created_at` | Creation timestamp |

### `conversation_members`

Maps a user to each conversation. Direct conversations must have exactly two members, enforced by the create-conversation flow and database constraints/RPC as appropriate.

| Field | Purpose |
| --- | --- |
| `conversation_id` | Conversation reference |
| `profile_id` | Member reference |
| `joined_at` | Membership creation timestamp |

### `messages`

| Field | Purpose |
| --- | --- |
| `id` | Message UUID; primary key |
| `conversation_id` | Parent conversation |
| `sender_id` | Sender profile |
| `content` | Optional text body |
| `image_url` | Optional Storage URL |
| `reply_to_id` | Optional referenced message |
| `created_at` | Send timestamp |
| `edited_at` | Optional edit timestamp |
| `deleted_at` | Optional soft-delete timestamp |

A message must contain text, an image, or both.

## Security rules

Row Level Security is enabled on every application table.

- A user may read only their own profile and discover limited public profile fields needed for search.
- A user may read a conversation and its messages only when they are a member.
- A user may insert messages only into a conversation they belong to and only with their own `sender_id`.
- A user may update or soft-delete only messages they sent.
- A user may upload to Storage only inside a path namespaced by their own user ID; message images are readable only to authorized conversation members through controlled access.

## Mobile interaction design

On phones, the default screen is the chat list. Selecting a conversation opens its detail screen full-width. The header provides a back action to return to the list. The composer remains pinned to the bottom, respects the mobile keyboard safe area, grows up to its max height, and has an attachment control, emoji picker, and disabled empty-send state.

On larger breakpoints, the existing multi-column layout can remain: conversation list, chat area, and optional details panel.

## Real-time behavior

- New, edited, and deleted messages update both conversation participants without refresh.
- Typing is transient client/realtime state, automatically cleared after inactivity and on unmount or send.
- Presence uses authenticated realtime presence and is best-effort; a disconnected client is shown offline or last seen.
- Optimistic sending displays a pending message immediately, reconciles it after persistence, and presents a retryable error if sending fails.

## Error handling

- Authentication forms display safe, actionable errors without revealing whether an email belongs to an existing account during sign-in.
- Upload validation limits allowed image formats and file size before upload.
- Failed image uploads do not send an incomplete message.
- Empty, unauthorized, or unavailable conversations show an understandable empty/error state rather than stale sample data.

## Verification

- Unit tests cover message validation and key data helpers.
- Component tests cover mobile navigation, empty-send behavior, typing cleanup, and own-message edit/delete controls.
- Integration tests verify authentication boundaries and RLS policies with two test users.
- A manual mobile viewport pass verifies the chat list, back navigation, keyboard/composer behavior, image sending, and real-time delivery between two sessions.

## Delivery sequence

1. Configure Supabase clients, environment variables, and email/password authentication screens.
2. Apply the schema, indexes, storage bucket, and RLS policies.
3. Replace seeded chat data with authenticated profile, conversation, and message queries.
4. Add real-time messages, typing, presence, and resilient sending behavior.
5. Add image upload and message actions.
6. Complete mobile interaction polish and run verification.
