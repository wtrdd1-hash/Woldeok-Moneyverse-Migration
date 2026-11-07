import type { VerifiedSecurityEvent, VerifiedSecuritySession } from './account-security-evidence';

export interface SecurityFeedback {
  readonly verified: boolean;
  readonly message: string;
}

/** A redirect query is a navigation hint, never a mutation receipt. */
export function securityFeedback(
  params: Record<string, string | string[] | undefined>,
  sessions: readonly VerifiedSecuritySession[] | null,
  events: readonly VerifiedSecurityEvent[] | null,
  now = Date.now(),
): SecurityFeedback | null {
  const hints = [
    params.reauth === 'done' ? 'reauth' : null,
    params.password === 'changed' ? 'password' : null,
    params.email === 'verification-sent' ? 'email' : null,
    params.session === 'revoked' ? 'session' : null,
    typeof params.revoked === 'string' ? 'revoked' : null,
  ].filter((hint): hint is string => hint !== null);
  if (hints.length === 0) return null;
  if (hints.length > 1) {
    return { verified: false, message: '여러 보안 작업 상태가 요청되었습니다. 아래 서버 기록에서 각각 확인해 주세요.' };
  }

  // Recent activity is evidence that an event was recorded, not that the URL
  // triggered it or that email delivery and other-device logout succeeded.
  const recently = (value: string | null): boolean => {
    if (!value) return false;
    const age = now - Date.parse(value);
    return Number.isFinite(age) && age >= 0 && age <= 5 * 60_000;
  };
  const recorded = (type: string): boolean =>
    events?.some((event) => event.type === type && recently(event.createdAt)) ?? false;

  switch (hints[0]) {
    case 'reauth':
      return sessions?.some((session) => session.current && recently(session.reauthenticatedAt))
        ? { verified: true, message: '현재 세션의 최근 본인 확인 기록이 확인되었습니다. 민감한 작업은 서버에서 다시 검증합니다.' }
        : { verified: false, message: '현재 세션의 본인 확인 기록을 확인할 수 없습니다. 필요하면 다시 본인 확인해 주세요.' };
    case 'password':
      return recorded('local_password_changed')
        ? { verified: true, message: '최근 비밀번호 변경 기록이 확인되었습니다. 다른 기기 로그아웃 여부는 기기 목록에서 별도로 확인해 주세요.' }
        : { verified: false, message: '비밀번호 변경 기록을 확인할 수 없습니다. 보안 활동을 새로고침하고 다시 확인해 주세요.' };
    case 'email':
      return recorded('local_email_change_requested')
        ? { verified: true, message: '이메일 변경 확인 메일 발송 요청이 접수되었습니다. 메일 발송·도착은 별도 확인이 필요합니다.' }
        : { verified: false, message: '이메일 변경 요청 기록을 확인할 수 없습니다. 보안 활동을 새로고침하고 다시 확인해 주세요.' };
    case 'session':
      return { verified: false, message: '선택한 기기의 종료 여부는 기기 목록에서 확인해 주세요. 주소의 종료 표시는 증빙이 아닙니다.' };
    case 'revoked':
      return sessions !== null && sessions.every((session) => session.current)
        ? { verified: true, message: '현재 다른 활성 세션이 없습니다. 종료 요청의 건수나 성공 여부는 주소만으로 확인할 수 없습니다.' }
        : { verified: false, message: '다른 세션 종료 여부를 확인할 수 없습니다. 기기 목록을 새로고침해 주세요.' };
    default:
      return null;
  }
}
