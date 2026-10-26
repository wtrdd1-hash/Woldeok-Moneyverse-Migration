import { readFileSync } from 'node:fs';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NewClubPage from './page';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const KEY = 'b2930dce-25c8-4e9c-a43a-4f7b349ba70a';
const CLUB = 'b23c58d8-42b4-47f3-96bc-4e3d73041c98';

function fillCharter() {
  fireEvent.change(screen.getByRole('textbox', { name: /클럽 태그/ }), {
    target: { value: 'ALPHA' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /클럽 이름/ }), {
    target: { value: 'Verified Club' },
  });
}

function submit() {
  fireEvent.submit(screen.getByRole('button', { name: /클럽 창설|처리 중/ }).closest('form')!);
}

describe('club charter submission contract', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => KEY) });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    push.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requires member authentication and prevents indexing of the paid form', () => {
    const layout = readFileSync('src/app/clubs/new/layout.tsx', 'utf8');
    expect(layout).toContain('await requireMember()');
    expect(layout).toContain('index: false, follow: false');
  });

  it('exposes accessible field labels and a private creation route', () => {
    render(<NewClubPage />);
    expect(screen.getByRole('textbox', { name: '클럽 소개글' })).toBeDefined();
    expect(screen.getByRole('textbox', { name: '클럽 헌장 및 운영 규칙' })).toBeDefined();
    expect(screen.getByRole('combobox', { name: '가입 방식' })).toBeDefined();
  });

  it('sends the required UUID to the real club API and navigates only after a valid receipt', async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ club_id: CLUB }),
    });
    vi.stubGlobal('fetch', request);
    render(<NewClubPage />);
    fillCharter();
    submit();
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    const [url, init] = request.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/clubs');
    expect(JSON.parse(init.body as string)).toMatchObject({
      tag: 'ALPHA',
      name: 'Verified Club',
      idempotencyKey: KEY,
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith(`/clubs/${CLUB}`));
  });

  it('does not send a second 10,000 WLD debit request while the first is pending', async () => {
    const request = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('fetch', request);
    render(<NewClubPage />);
    fillCharter();
    submit();
    submit();
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect((screen.getByRole('button', { name: /처리 중/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('holds ambiguous network failures without permitting a dangerous paid retry', async () => {
    const request = vi.fn().mockRejectedValue(new TypeError('network failed'));
    vi.stubGlobal('fetch', request);
    render(<NewClubPage />);
    fillCharter();
    submit();
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toMatch(/결과를 확인할 수 없습니다/),
    );
    expect((screen.getByRole('button', { name: /클럽 창설/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(screen.getByRole('link', { name: /클럽 목록 확인/ }).getAttribute('href')).toBe(
      '/clubs',
    );
    submit();
    expect(request).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('shows a definitive client-side API rejection without claiming the club was created', async () => {
    const request = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'tag already exists' }),
    });
    vi.stubGlobal('fetch', request);
    render(<NewClubPage />);
    fillCharter();
    submit();
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('tag already exists'),
    );
    expect(push).not.toHaveBeenCalled();
    expect((screen.getByRole('button', { name: /클럽 창설/ }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it('treats a successful HTTP response without a verified club UUID as uncertain', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
    );
    render(<NewClubPage />);
    fillCharter();
    submit();
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toMatch(/결과를 확인할 수 없습니다/),
    );
    expect(push).not.toHaveBeenCalled();
  });
});
