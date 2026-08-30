import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Without this each render stacks onto the previous one's DOM, and a query
// finds an element an earlier test left behind rather than the one under test.
afterEach(cleanup);
import type { ProfileView } from './profile';
import { ProfileCard, displayName } from './profile-parts';

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

describe('displayName', () => {
  it('uses the name the view returned', () => {
    expect(displayName(view())).toBe('월덕이');
  });

  // The view coalesces the stored name with the OAuth identity's, and both
  // can be null -- a member whose identity row is gone. A blank heading
  // would read as a rendering fault.
  it('names a member with no name at all rather than rendering a blank', () => {
    expect(displayName(view({ display_name: null }))).toBe('이름 없는 회원');
    expect(displayName(view({ display_name: '   ' }))).toBe('이름 없는 회원');
  });
});

describe('ProfileCard, to its owner', () => {
  // Every field is returned to the member themselves, so a null here is
  // "nothing yet" and saying it is the whole difference from the other card.
  it('says a missing job is a record not kept yet', () => {
    render(<ProfileCard profile={view()} self />);
    expect(screen.getByText('아직 직업 기록이 없어요')).toBeDefined();
    expect(screen.getByText('아직 기록이 없어요')).toBeDefined();
  });

  it('shows the whole-profile setting the member chose', () => {
    render(<ProfileCard profile={view({ visibility: 'private' })} self />);
    expect(screen.getByText('비공개')).toBeDefined();
  });

  it('points at the settings below rather than at somebody else’s choices', () => {
    render(<ProfileCard profile={view()} self />);
    expect(screen.getByText(/나에게 보이는 전부/)).toBeDefined();
    expect(screen.queryByText(/공개하기로 한 항목만/)).toBeNull();
  });
});

describe('ProfileCard, to another member', () => {
  // A null is either a withheld field or an empty one and 080 answers the
  // same way for both. Dropping the row and saying so once is the only
  // honest reading; "비공개" per row would claim to know which it was.
  it('drops a field that did not arrive instead of calling it private', () => {
    render(<ProfileCard profile={view()} self={false} />);
    expect(screen.queryByText('직업')).toBeNull();
    expect(screen.queryByText('완료한 작업')).toBeNull();
  });

  it('says so plainly when nothing but the join date survived', () => {
    render(<ProfileCard profile={view()} self={false} />);
    expect(screen.getByText('이 회원이 공개한 항목이 없어서 함께한 날짜만 보여요.')).toBeDefined();
  });

  it('shows the fields the member did publish, in Korean', () => {
    render(
      <ProfileCard
        profile={view({ job_type: 'miner', job_level: 4, featured_title: 'starter' })}
        self={false}
      />,
    );
    expect(screen.getByText('광부')).toBeDefined();
    expect(screen.getByText('· 4레벨')).toBeDefined();
    expect(screen.getByText('첫걸음')).toBeDefined();
    expect(screen.getByText('이 회원이 공개하기로 한 항목만 보여요.')).toBeDefined();
  });

  // The subject's own setting is not a fact they published, and the reader
  // learns nothing from it that the page does not already show.
  it('does not publish the subject’s visibility setting to a reader', () => {
    render(<ProfileCard profile={view({ visibility: 'public', job_type: 'farmer' })} self={false} />);
    expect(screen.queryByText('전체 공개')).toBeNull();
  });
});

describe('ProfileCard figures', () => {
  // work_completions is a bigint. Rounding it through Number would change
  // what the member is being told they did.
  it('keeps every digit of a completion count far beyond a safe integer', () => {
    const huge = '9' + '0'.repeat(20);
    const { container } = render(
      <ProfileCard profile={view({ work_completions: huge })} self={false} />,
    );
    const grouped = screen.getByText('900,000,000,000,000,000,000');
    expect(grouped.textContent?.replace(/,/g, '')).toBe(huge);
    expect(container.textContent).toContain('회');
  });

  it('groups a completion count the way every other figure on the site is grouped', () => {
    render(<ProfileCard profile={view({ work_completions: '12000' })} self />);
    expect(screen.getByText('12,000')).toBeDefined();
  });

  it('renders a member’s image without telling the host which page linked to it', () => {
    const { container } = render(
      <ProfileCard profile={view({ image_url: 'https://example.test/a.png' })} self />,
    );
    const image = container.querySelector('img');
    expect(image?.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(image?.getAttribute('alt')).toBe('월덕이 프로필 이미지');
  });

  // A letter in a circle, not a broken image icon and not an empty hole.
  it('falls back to the first letter of the name when there is no image', () => {
    const { container } = render(<ProfileCard profile={view()} self />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('월')).toBeDefined();
  });
});
