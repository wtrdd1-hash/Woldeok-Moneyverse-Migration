/**
 * What `server-only` resolves to under vitest.
 *
 * The real package is a build-time guard: importing it from a client bundle
 * fails the build. There is no such bundle in a test run, and leaving it
 * unresolvable means a server module cannot be tested at all.
 */
export {};
