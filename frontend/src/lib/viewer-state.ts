/**
 * Who is reading the page.
 *
 * In its own module, with no `server-only`, because both halves need it: the
 * server route that resolves it and the client rail that renders from it.
 *
 * A signed-out reader is a normal state of this application, not a failure,
 * so every field has a meaningful value for one.
 */
export interface Viewer {
  readonly signedIn: boolean;
  /** False when the member has not accepted the currently published policy. */
  readonly consentCurrent: boolean;
  readonly adminRoles: readonly string[];
}

export const SIGNED_OUT: Viewer = { signedIn: false, consentCurrent: false, adminRoles: [] };

/** A member who may open an administrator page: signed in, consented, holds a role. */
export function isAdministrator(viewer: Viewer): boolean {
  return viewer.signedIn && viewer.consentCurrent && viewer.adminRoles.length > 0;
}
