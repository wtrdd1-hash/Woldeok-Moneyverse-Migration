/**
 * Nothing this application sends to Discord may ping anybody.
 *
 * Two independent guards, because they fail differently. `NO_MENTIONS` is the
 * authoritative one: with an empty `parse` allowlist Discord resolves no
 * mention at all, whatever the text says, and it applies to the reply to a
 * slash command as much as to an outbox announcement. The rewrite below is
 * what stops a message from *displaying* a raw `@everyone` that a member
 * would read as a real one — and what keeps the guarantee if a future message
 * is ever sent by a path that forgets the allowlist.
 *
 * The alternative — trusting that no member-supplied string ever reaches a
 * message — was rejected because it is a property of every call site at once,
 * and `/history` already renders labels this module did not write.
 */

/**
 * Discord's `allowed_mentions`. An empty `parse` array is not the same as
 * omitting the field: omitted, Discord parses every mention in the content.
 */
export const NO_MENTIONS = Object.freeze({
  parse: Object.freeze([] as string[]),
  users: Object.freeze([] as string[]),
  roles: Object.freeze([] as string[]),
  replied_user: false,
});

// The complete set of constructs Discord turns into a notification: the two
// bare keywords, a user mention (`<@id>` or the legacy `<@!id>`) and a role
// mention (`<@&id>`). A channel link (`<#id>`) notifies nobody and is left
// alone.
const MENTION = /@everyone|@here|<@[!&]?\d{1,32}>/gi;

// Everything invisible: control characters other than the newline these
// messages are built from, and the zero-width characters that let a
// spaced-out `@everyone` render as one nobody can tell from the real thing.
const INVISIBLE = /[\u0000-\u0009\u000b-\u001f\u007f\u200b-\u200f\u2060\ufeff]/g;

/** Discord rejects a message body longer than this outright. */
export const MAX_MESSAGE_LENGTH = 2_000;

/**
 * Strip every mention construct and every invisible character, then clamp.
 *
 * Removed rather than escaped: a zero-width space between `@` and `everyone`
 * survives a copy-paste and reads as a real mention in most clients, so the
 * common escaping trick makes the text look more trustworthy than it is.
 */
export function withoutMentions(text: unknown): string {
  if (typeof text !== 'string') return '';
  return text.replace(INVISIBLE, '').replace(MENTION, '').slice(0, MAX_MESSAGE_LENGTH);
}
