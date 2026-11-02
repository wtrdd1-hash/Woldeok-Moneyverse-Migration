export type BoardDiscussionOrder = 'recent' | 'discussed';

export function parseBoardDiscussionOrder(value: unknown): { order: BoardDiscussionOrder; invalid: boolean } {
  if (value === undefined || value === 'recent') return { order: 'recent', invalid: false };
  if (value === 'discussed') return { order: 'discussed', invalid: false };
  return { order: 'recent', invalid: true };
}
