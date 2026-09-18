import Link from 'next/link';

export function DeletionRequestInfo({ mode }: { readonly mode: 'account' | 'data' }) {
  const isAccount = mode === 'account';

  return (
    <article className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 text-sm leading-7 [overflow-wrap:anywhere]">
      <section className="grid gap-2">
        <h2 className="text-xl font-semibold">대상 서비스</h2>
        <p><strong>앱:</strong> 월덕 머니버스</p>
        <p><strong>운영자·개발자:</strong> 홍종환</p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold">
          {isAccount ? '계정 삭제 요청 방법' : '개인정보 삭제 요청 방법'}
        </h2>
        <ol className="list-decimal space-y-1 pl-6">
          <li>로그인 후 <Link className="underline" href="/account">내 계정</Link>으로 이동합니다.</li>
          <li>
            {isAccount
              ? '계정 삭제 영역에서 안내를 확인하고 삭제 요청을 제출합니다.'
              : '개인정보 요청 메뉴에서 ‘개인정보 삭제 요청’을 선택해 제출합니다.'}
          </li>
          <li>
            로그인할 수 없으면 가입에 사용한 이메일 주소에서{' '}
            <a className="underline" href="mailto:jungchwimisaenghwal63@gmail.com">
              jungchwimisaenghwal63@gmail.com
            </a>
            으로 요청할 수 있습니다.
          </li>
        </ol>
        <p>
          이메일 요청 시 비밀번호, 인증번호, 세션 토큰 등 비밀정보를 보내지 마세요. 본인 확인을 위해 최소한의 추가 확인을 요청할 수 있습니다.
        </p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-xl font-semibold">삭제 및 보관 기준</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>OAuth 연결 정보와 프로필 식별정보: 탈퇴 처리 후 30일 이내 삭제.</li>
          <li>프로필·갤러리 사진: 요청 접수 시 공개 접근을 차단하고 파일·메타데이터를 30일 이내 삭제.</li>
          <li>
            내부 계정·가상경제 기록: 탈퇴 후 30일 이내 식별 연결을 제거하고, 대사에 필요한 잔여 기록은 재식별 불가능한 형태로 최대 1년 보관 후 익명화 또는 삭제.
          </li>
          <li>정책 동의 증명은 탈퇴 후 3년, 일반 접속·인증 기록은 90일, 관리자·경제 감사 기록은 최대 1년 보관될 수 있습니다.</li>
        </ul>
        <p>
          법령상 보존 의무, 분쟁 또는 보안 조사로 즉시 삭제할 수 없는 정보는 필요한 범위에서 분리 보관한 뒤 사유가 끝나면 삭제합니다.
        </p>
      </section>

      <p>
        상세 기준은 <Link className="underline" href="/privacy">개인정보처리방침</Link>에서 확인할 수 있습니다.
      </p>
    </article>
  );
}
