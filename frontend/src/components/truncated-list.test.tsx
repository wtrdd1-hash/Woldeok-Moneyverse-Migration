import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Without this each render stacks onto the previous one's DOM, and a query
// finds an element an earlier test left behind rather than the one under test.
afterEach(cleanup);
import { PostingStrip } from './posting-strip';
import { TruncatedList } from './truncated-list';

/** Numbered rows, so an assertion can name the one it expects to be hidden. */
function rows(count: number) {
  return Array.from({ length: count }, (_, index) => <p key={index}>행 {index + 1}</p>);
}

/** Clicks the 더보기 control and hands back the dialog it opened. */
function openTheRest(): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
  return screen.getByRole('dialog');
}

describe('TruncatedList with nothing left over', () => {
  it('shows every row and offers no control when the list is shorter than the cut', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(3)} visibleCount={5} />);
    expect(screen.getByText('행 3')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('offers no control when the list is exactly the length of the cut', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(5)} visibleCount={5} />);
    expect(screen.getByText('행 5')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('offers no control for an empty list', () => {
    render(<TruncatedList title="내 지갑 기록" rows={[]} visibleCount={5} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('TruncatedList counting', () => {
  it('uses the requested compact 더보기 label', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    expect(screen.getByRole('button', { name: '내 지갑 기록 더보기' })).toBeDefined();
  });

  it('leaves the hidden rows out of the page until the dialog opens', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    expect(screen.getByText('행 5')).toBeDefined();
    expect(screen.queryByText('행 6')).toBeNull();
    expect(screen.queryByText('행 12')).toBeNull();
  });

  it('puts every row behind the control when none is shown on the page', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(4)} visibleCount={0} />);
    expect(screen.getByRole('button', { name: '내 지갑 기록 더보기' })).toBeDefined();
    expect(screen.queryByText('행 1')).toBeNull();
  });

  it('treats a cut longer than the list as no cut at all', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(2)} visibleCount={99} />);
    expect(screen.getByText('행 2')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('TruncatedList dialog', () => {
  it('shows the entire list, including the preview rows', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    const dialog = openTheRest();

    expect(dialog.textContent).toContain('행 1');
    expect(dialog.textContent).toContain('행 6');
    expect(dialog.textContent).toContain('행 12');
    // The preview stays visible behind the modal and is intentionally
    // repeated inside it: the modal is a complete view, not a remainder.
    expect(screen.getAllByText('행 1')).toHaveLength(2);
  });

  it('names the dialog with the list title', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    openTheRest();
    expect(screen.getByRole('dialog', { name: '내 지갑 기록' })).toBeDefined();
  });

  it('states that the dialog contains the complete list', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    openTheRest();
    expect(screen.getByText('전체 12개를 볼 수 있어요.')).toBeDefined();
  });

  it('takes a description of its own', () => {
    render(
      <TruncatedList
        title="내 지갑 기록"
        rows={rows(12)}
        visibleCount={5}
        description="원장에 남은 기록입니다."
      />,
    );
    openTheRest();
    expect(screen.getByText('원장에 남은 기록입니다.')).toBeDefined();
  });

  it('moves focus into the dialog and freezes the page behind it', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    const dialog = openTheRest();

    expect(dialog.contains(document.activeElement)).toBe(true);
    // What stops the page scrolling under the dialog. Radix sets it; this
    // asserts it is still set, because a stray `modal={false}` would not fail
    // any other assertion here.
    expect(document.body.dataset.scrollLocked).toBe('1');
  });

  it('closes on Escape and gives focus back to the control', async () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    const trigger = screen.getByRole('button', { name: /더보기/ });
    openTheRest();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.dataset.scrollLocked).toBeUndefined();
    // Radix restores focus on a task of its own, so this waits rather than
    // reading document.activeElement in the same tick.
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('closes on its own close control', async () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    const trigger = screen.getByRole('button', { name: /더보기/ });
    openTheRest();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('reopens after it has been closed', () => {
    render(<TruncatedList title="내 지갑 기록" rows={rows(12)} visibleCount={5} />);
    openTheRest();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(openTheRest().textContent).toContain('행 12');
  });
});

describe('TruncatedList with the rows a page really passes', () => {
  // The rows are rendered by the server component and handed over as
  // children. This is that shape: the strips are built here, not in there.
  it('splits already-rendered postings across the page and the dialog', () => {
    const entries = Array.from({ length: 7 }, (_, index) => (
      <PostingStrip
        key={index}
        debit="내 지갑"
        credit={`상점 ${index + 1}`}
        amount={`${index + 1}000`}
      />
    ));
    render(
      <TruncatedList
        title="내 지갑 기록"
        rows={entries}
        visibleCount={5}
        listClassName="grid gap-3"
      />,
    );

    expect(screen.getByText('상점 5')).toBeDefined();
    expect(screen.queryByText('상점 6')).toBeNull();

    const dialog = openTheRest();
    expect(dialog.textContent).toContain('상점 7');
    // Grouped, not rounded — the strip is still doing its own formatting in
    // here rather than being re-rendered by this component.
    expect(dialog.textContent).toContain('7,000');
  });
});
