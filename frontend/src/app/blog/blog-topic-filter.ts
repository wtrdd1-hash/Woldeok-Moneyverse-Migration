import type { BlogHubSummary } from './blog-hub-client';
import type { VerifiedEditorialTopic } from './blog.types';

export type VerifiedTopicSelection = 'ALL' | VerifiedEditorialTopic;

/** A selected editorial topic is proof-bound; seed and legacy articles are not verified. */
export function filterVerifiedEditorialTopic<T extends Pick<BlogHubSummary, 'verifiedTopic'>>(
  posts: readonly T[], topic: VerifiedTopicSelection,
): T[] {
  return topic === 'ALL' ? [...posts] : posts.filter(post => post.verifiedTopic === topic);
}
