import { describe, expect, it } from 'vitest';
import { MAX_MESSAGE_LENGTH, NO_MENTIONS, withoutMentions } from './mentions';

/**
 * A ping is the one thing a message from this application must never produce.
 * Both guards are tested, because either alone would be a single point of
 * failure: the allowlist is what Discord enforces, the rewrite is what stops
 * a member reading a convincing fake.
 */
describe('mention allowlisting', () => {
  it('parses no mention of any kind', () => {
    expect(NO_MENTIONS.parse).toEqual([]);
    expect(NO_MENTIONS.users).toEqual([]);
    expect(NO_MENTIONS.roles).toEqual([]);
    expect(NO_MENTIONS.replied_user).toBe(false);
  });

  it('cannot be edited by a caller that receives it', () => {
    expect(Object.isFrozen(NO_MENTIONS)).toBe(true);
    expect(Object.isFrozen(NO_MENTIONS.parse)).toBe(true);
  });

  it('removes the two keywords whatever their case', () => {
    expect(withoutMentions('공지 @everyone 입니다')).toBe('공지  입니다');
    expect(withoutMentions('@EVERYONE')).toBe('');
    expect(withoutMentions('@Here 보세요')).toBe(' 보세요');
  });

  it('removes role and user mentions', () => {
    expect(withoutMentions('<@&123456789012345678> 확인')).toBe(' 확인');
    expect(withoutMentions('<@123456789012345678>')).toBe('');
    expect(withoutMentions('<@!123456789012345678>')).toBe('');
  });

  // A channel link notifies nobody, so removing it would only mangle a
  // legitimate message.
  it('leaves a channel link alone', () => {
    expect(withoutMentions('<#123456789012345678>')).toBe('<#123456789012345678>');
  });

  /**
   * The reason the keyword rewrite runs after the invisible-character strip:
   * a zero-width space between the `@` and the word does not ping, but it
   * renders as one, and a member who cannot tell the difference is exactly
   * who a spoofed announcement targets.
   */
  it('strips the zero-width characters that disguise a mention', () => {
    expect(withoutMentions('@\u200beveryone')).toBe('');
    expect(withoutMentions('@\ufeffhere')).toBe('');
  });

  it('drops control characters but keeps the newline a message is built from', () => {
    expect(withoutMentions('첫 줄\n둘째 줄')).toBe('첫 줄\n둘째 줄');
    expect(withoutMentions('\u0007\u001b[31m 보고서')).toBe('[31m 보고서');
  });

  it('clamps to what Discord will accept', () => {
    expect(withoutMentions('가'.repeat(MAX_MESSAGE_LENGTH + 50))).toHaveLength(MAX_MESSAGE_LENGTH);
  });

  it('answers with an empty string for anything that is not text', () => {
    expect(withoutMentions(undefined)).toBe('');
    expect(withoutMentions({ toString: () => '@everyone' })).toBe('');
  });
});
