import { describe, expect, it } from 'vitest';
import type { ProfileSettings, ProfileView } from './profile';
import {
  INHERIT,
  NO_TITLE,
  VISIBILITY_FIELDS,
  fieldInputName,
  fieldVisibilityFrom,
  isImageAddress,
  isTitleCode,
  isUuid,
  isVisibility,
  jobLabel,
  nothingShown,
  savedSentence,
  titleChoices,
  titleLabel,
  visibilityLabel,
} from './profile';

function view(overrides: Partial<ProfileView> = {}): ProfileView {
  return {
    display_name: '월덕이',
    image_url: null,
    joined_at: '2026-01-02T03:04:05.000Z',
    job_type: null,
    job_level: null,
    work_completions: null,
    visibility: 'members',
    featured_title: null,
    ...overrides,
  };
}

describe('visibility vocabulary', () => {
  it('accepts exactly the three values the profile_visibility enum allows', () => {
    expect(isVisibility('public')).toBe(true);
    expect(isVisibility('members')).toBe(true);
    expect(isVisibility('private')).toBe(true);
    expect(isVisibility('friends')).toBe(false);
    expect(isVisibility('')).toBe(false);
  });

  it('names each visibility in Korean', () => {
    expect(visibilityLabel('public')).toBe('전체 공개');
    expect(visibilityLabel('members')).toBe('회원 공개');
    expect(visibilityLabel('private')).toBe('비공개');
  });

  // A migration may widen the enum long before this build hears about it.
  // Showing the stored value is worse than a name and better than a blank
  // where the member's own setting should be.
  it('falls back to the value itself for a visibility it has not been taught', () => {
    expect(visibilityLabel('followers')).toBe('followers');
  });
});

describe('fieldVisibilityFrom', () => {
  it('sends nothing for a field left on the profile setting', () => {
    const chosen = Object.fromEntries(
      VISIBILITY_FIELDS.map((field) => [field.key, INHERIT] as const),
    );
    expect(fieldVisibilityFrom(chosen)).toEqual({});
  });

  it('treats an unset control the same as inheriting', () => {
    expect(fieldVisibilityFrom({})).toEqual({});
  });

  it('keeps only the fields the member decided for themselves', () => {
    expect(fieldVisibilityFrom({ imageUrl: 'private', workCompletions: 'public' })).toEqual({
      imageUrl: 'private',
      workCompletions: 'public',
    });
  });

  // 080 accepts any key and validates only the values, so a key nothing reads
  // would be stored happily and the member would be told a field is private
  // while every other member kept seeing it. The API rejects unknown keys and
  // this never offers one.
  it('never carries a key outside the five the view consults', () => {
    const fields = fieldVisibilityFrom({ imageURL: 'private', jobType: 'members' });
    expect(fields).toEqual({ jobType: 'members' });
  });

  // Refused rather than dropped: storing four of the five settings silently
  // would leave the fifth showing to an audience the member did not pick.
  it('refuses the whole map when one setting is not a visibility', () => {
    expect(fieldVisibilityFrom({ imageUrl: 'nobody' })).toBeNull();
  });

  it('names each control so a field key cannot collide with the profile setting', () => {
    expect(fieldInputName('profile')).toBe('field.profile');
    expect(fieldInputName('profile')).not.toBe('visibility');
  });
});

describe('jobLabel', () => {
  it('names each work_job_type value in Korean', () => {
    expect(jobLabel('farmer')).toBe('농부');
    expect(jobLabel('merchant')).toBe('상인');
  });

  it('falls back to the code for a job this build has not been taught', () => {
    expect(jobLabel('archivist')).toBe('archivist');
  });
});

describe('titles', () => {
  it('names each seeded title in Korean', () => {
    expect(titleLabel('starter')).toBe('첫걸음');
    expect(titleLabel('season_honour')).toBe('시즌 명예');
  });

  it('offers no title as well as the seeded ones', () => {
    const values = titleChoices(null).map((choice) => choice.value);
    expect(values[0]).toBe(NO_TITLE);
    expect(values).toContain('helper');
  });

  // The write is a replacement, so a title missing from the control is a
  // title that gets cleared. One awarded by a later migration has to stay
  // selectable by whoever is already wearing it.
  it('keeps a title the member is already displaying that this build does not know', () => {
    expect(titleChoices('founding_member').map((choice) => choice.value)).toContain(
      'founding_member',
    );
  });

  it('does not offer an unknown title twice when it is also a seeded one', () => {
    const values = titleChoices('helper').map((choice) => choice.value);
    expect(values.filter((value) => value === 'helper')).toHaveLength(1);
  });

  it('matches the code pattern 079 puts on member_titles', () => {
    expect(isTitleCode('season_honour')).toBe(true);
    expect(isTitleCode('Helper')).toBe(false);
    expect(isTitleCode('ab')).toBe(false);
  });
});

describe('isImageAddress', () => {
  it('accepts an absolute http or https address', () => {
    expect(isImageAddress('https://example.test/a.png')).toBe(true);
    expect(isImageAddress('http://example.test/a.png')).toBe(false);
  });

  it('accepts a path on this site, which is how a served photo addresses itself', () => {
    expect(isImageAddress('/media/abc123')).toBe(true);
  });

  // The value is rendered into an img element. A scheme-relative address
  // reads as a path and loads from somebody else's origin.
  it('refuses an address that only looks like a path', () => {
    expect(isImageAddress('//example.test/a.png')).toBe(false);
    expect(isImageAddress('/\\example.test/a.png')).toBe(false);
  });

  it('refuses a scheme that is not http or https', () => {
    expect(isImageAddress('javascript:alert(1)')).toBe(false);
    expect(isImageAddress('data:image/png;base64,AAAA')).toBe(false);
    expect(isImageAddress('not an address')).toBe(false);
  });
});

describe('isUuid', () => {
  it('accepts the shape ParseUUIDPipe accepts', () => {
    expect(isUuid('00000000-0000-4000-8000-000000000001')).toBe(true);
  });

  it('refuses anything else, so a bad link is never sent to the API', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid('')).toBe(false);
  });
});

describe('savedSentence', () => {
  function settings(overrides: Partial<ProfileSettings> = {}): ProfileSettings {
    return {
      visibility: 'members',
      display_name: '월덕이',
      image_url: null,
      field_visibility: {},
      featured_title: null,
      ...overrides,
    };
  }

  // Reported from the row the database returned, not from the form that was
  // sent: the write is a replacement and what the member most needs to know
  // afterwards is what their profile says now.
  it('says the stored visibility and that nothing was set per field', () => {
    expect(savedSentence(settings())).toBe(
      '프로필을 회원 공개로 저장했어요. 항목별 공개 범위는 모두 프로필 설정을 따라요.',
    );
  });

  it('counts the fields that were decided separately', () => {
    const sentence = savedSentence(
      settings({ visibility: 'private', field_visibility: { imageUrl: 'private', jobType: 'public' } }),
    );
    expect(sentence).toBe('프로필을 비공개로 저장했어요. 항목별로 따로 정한 것은 2개예요.');
  });
});

describe('nothingShown', () => {
  // A card carrying only a name and a date reads as a broken page rather than
  // as a member who keeps to themselves, so the screen says so instead.
  it('is true when every optional field came back withheld or empty', () => {
    expect(nothingShown(view())).toBe(true);
  });

  it('is false as soon as one field survived', () => {
    expect(nothingShown(view({ work_completions: '0' }))).toBe(false);
    expect(nothingShown(view({ featured_title: 'starter' }))).toBe(false);
  });
});
