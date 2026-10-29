/**
 * A published edition identity is server authority, not a human review certificate.
 * Keep PostgreSQL bigint as a decimal string (never round through JS Number).
 */
export type HelpPublicationIdentity = {
  readonly published_revision_id: string;
  readonly article_version: string;
  readonly content_digest: string;
};

export function requireHelpPublicationIdentity(value: unknown): HelpPublicationIdentity {
  if (!value || typeof value !== 'object') throw new Error('help publication identity unavailable');
  const candidate = value as Record<string, unknown>;
  const revision = candidate.published_revision_id;
  const version = candidate.article_version;
  const digest = candidate.content_digest;
  if (typeof revision !== 'string' ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(revision) ||
    typeof version !== 'string' || !/^[1-9][0-9]*$/.test(version) ||
    typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest)) {
    throw new Error('help publication identity unavailable');
  }
  return { published_revision_id: revision, article_version: version, content_digest: digest };
}
