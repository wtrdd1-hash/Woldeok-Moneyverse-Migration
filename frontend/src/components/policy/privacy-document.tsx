import Link from 'next/link';

interface PrivacyDocumentProps {
  locale?: string;
}

export function PrivacyDocument({ locale = 'ko' }: PrivacyDocumentProps) {
  const isEn = locale !== 'ko';

  if (isEn) {
    return (
      <article className="policy-document grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 [overflow-wrap:anywhere]">
        <p className="section-label">WOLDEOK MONEYVERSE · PRIVACY POLICY</p>
        <p className="max-w-prose text-sm text-muted-foreground">
          Woldeok Moneyverse processes personal data on a strict data-minimization basis, limited to authentication, ledger integrity, and security operations.
          This document details what data is collected, why it is processed, and our retention schedules.
        </p>
        <dl className="grid gap-2 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3" aria-label="Document Metadata">
          <div><dt>Version</dt><dd>2026-09-02</dd></div>
          <div><dt>Effective Date</dt><dd>September 2, 2026</dd></div>
          <div><dt>Status</dt><dd>Production Release</dd></div>
        </dl>
        <aside className="rounded-lg border-l-4 border-l-primary bg-card p-4" aria-label="Key Privacy Principle">
          <strong>Core Privacy Tenet</strong>
          <p>
            OAuth access/refresh tokens and raw email addresses are not stored long-term.
            Access IP addresses are encrypted and stored solely for fraud prevention and cyber incident response.
            Public pages may feature Google AdSense displays subject to Google&apos;s standard cookie and advertising policies.
          </p>
        </aside>
        <nav className="rounded-lg border bg-card p-4 text-sm" aria-label="Table of Contents">
          <p className="font-semibold mb-2">Table of Contents</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li><a href="#privacy-data" className="hover:underline">1. Collected Data, Purpose & Retention Periods</a></li>
            <li><a href="#privacy-sharing" className="hover:underline">2. Third-Party Sharing & Cross-Border Transfers</a></li>
            <li><a href="#privacy-cookies" className="hover:underline">3. Cookies & Session Storage</a></li>
            <li><a href="#privacy-rights" className="hover:underline">4. User Rights & Data Portability</a></li>
            <li><a href="#privacy-contact" className="hover:underline">5. Contact Information & Policy Updates</a></li>
          </ol>
        </nav>
        <section id="privacy-data">
          <h2>1. Data Categories, Processing Purposes & Retention</h2>
          <p>We process only the minimum information necessary to provide services.</p>
          <div className="overflow-x-auto rounded-lg border" tabIndex={0} aria-label="Personal Data Table">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th scope="col" className="p-2 sm:p-3">Category</th>
                  <th scope="col" className="p-2 sm:p-3">Collected Items</th>
                  <th scope="col" className="p-2 sm:p-3">Processing Purpose</th>
                  <th scope="col" className="p-2 sm:p-3">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <th scope="row" className="p-2 sm:p-3 font-semibold">OAuth Login</th>
                  <td className="p-2 sm:p-3">Provider ID, Display Name</td>
                  <td className="p-2 sm:p-3">User authentication, anti-fraud</td>
                  <td className="p-2 sm:p-3">Purged within 30 days of deletion</td>
                </tr>
                <tr>
                  <th scope="row" className="p-2 sm:p-3 font-semibold">Virtual Ledger</th>
                  <td className="p-2 sm:p-3">Internal UID, WLD transactions</td>
                  <td className="p-2 sm:p-3">Simulation ledger reconciliation</td>
                  <td className="p-2 sm:p-3">De-identified or retained up to 1 year</td>
                </tr>
                <tr>
                  <th scope="row" className="p-2 sm:p-3 font-semibold">Security Audit</th>
                  <td className="p-2 sm:p-3">Masked IP, User-Agent, API method</td>
                  <td className="p-2 sm:p-3">DDoS mitigation, anomaly detection</td>
                  <td className="p-2 sm:p-3">General logs 90 days; audit 1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="privacy-sharing">
          <h2>2. Third-Party Sharing & Disclosures</h2>
          <p>
            Woldeok Moneyverse does not sell or lease user data to third parties.
            External integrations are limited to OAuth identity providers (Discord, Google) and hosting infrastructure (Cloudflare, Supabase).
          </p>
        </section>
        <section id="privacy-cookies">
          <h2>3. Cookies & Session Management</h2>
          <p>
            We use secure HTTP-only session cookies strictly necessary to maintain authentication state.
            Third-party analytics and advertising cookies are managed under opt-out preferences.
          </p>
        </section>
        <section id="privacy-rights">
          <h2>4. User Rights & Data Deletion</h2>
          <p>
            Users possess the right to view, correct, or permanently expunge their personal records at any time.
            Self-service deletion is accessible via <Link href="/account" className="text-primary hover:underline">Account Settings</Link> or by contacting the Privacy Officer.
          </p>
        </section>
        <section id="privacy-contact">
          <h2>5. Privacy Officer & Inquiries</h2>
          <p>
            Data Protection Officer: Hong Jong-hwan (<a href="mailto:jungchwimisaenghwal63@gmail.com" className="text-primary hover:underline">jungchwimisaenghwal63@gmail.com</a>).
          </p>
        </section>
      </article>
    );
  }

  return (
    <article className="policy-document grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 [overflow-wrap:anywhere]">
      <p className="section-label">WOLDEOK MONEYVERSE · PRIVACY POLICY</p>
      <p className="max-w-prose text-sm text-muted-foreground">
        월덕 머니버스는 로그인, 가상경제 원장, 보안에 필요한 정보만 최소한으로 처리합니다.
        무엇을 왜 처리하고 언제 지우는지 운영 기준으로 공개합니다.
      </p>
      <dl className="grid gap-2 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3" aria-label="문서 정보">
        <div><dt>문서 버전</dt><dd>2026-09-02</dd></div>
        <div><dt>시행일</dt><dd>2026년 9월 2일</dd></div>
        <div><dt>문서 상태</dt><dd>운영 서버 적용본</dd></div>
      </dl>
      <aside className="rounded-lg border-l-4 border-l-primary bg-card p-4" aria-label="핵심 개인정보 원칙">
        <strong>핵심 원칙</strong>
        <p>OAuth 접근·갱신 토큰과 Google 이메일은 장기 저장하지 않습니다. 접속 IP는 보안·장애 대응을 위해 제한된 운영 데이터베이스에 저장하고 일반 화면과 Discord 운영 알림에는 축약 네트워크만 표시합니다. 홈·운영 소식·운영 검토 갤러리처럼 광고가 허용된 공개 정보 화면에서는 Google AdSense 광고가 표시될 수 있으며, 그 경우 Google의 광고 쿠키·식별자 사용과 선택 절차가 적용됩니다.</p>
      </aside>
      <nav className="rounded-lg border bg-card p-4 text-sm" aria-label="개인정보처리방침 목차">
        <p>목차</p>
        <ol>
          <li><a href="#privacy-data">처리 항목·목적·기간</a></li>
          <li><a href="#privacy-sharing">제3자·위탁·국외 이전</a></li>
          <li><a href="#privacy-cookies">쿠키와 세션</a></li>
          <li><a href="#privacy-rights">이용자의 권리</a></li>
          <li><a href="#privacy-contact">연락처와 변경</a></li>
        </ol>
      </nav>
      <section id="privacy-data">
        <h2>1. 처리하는 개인정보, 목적과 보유 기간</h2>
        <p>서비스는 서비스 제공에 필요한 최소한의 정보만 처리합니다. 법령상 별도 보존 의무가 있는 경우를 제외하고, 아래 기간이 끝나면 지체 없이 파기하거나 재식별할 수 없도록 처리합니다.</p>
        <div className="overflow-x-auto rounded-lg border" tabIndex={0} aria-label="개인정보 처리 항목 표는 가로로 스크롤할 수 있습니다.">
          <table>
            <thead>
              <tr><th scope="col">구분</th><th scope="col">처리 항목</th><th scope="col">처리 목적</th><th scope="col">보유 기간</th></tr>
            </thead>
            <tbody>
              <tr><th scope="row">OAuth 로그인</th><td>로그인 제공자, 제공자 고유 식별자, 표시명</td><td>로그인, 내부 계정 생성·연결, 중복 연결 방지, 계정 보호</td><td>탈퇴 처리 후 30일 이내 삭제</td></tr>
              <tr><th scope="row">내부 계정·가상경제</th><td>내부 사용자 ID, 계정 상태, 지갑·잔액, 송금·보상·구매·거래 기록</td><td>가상경제 제공, 거래 영수증, 부정 이용 방지, 원장 대사</td><td>탈퇴 후 30일 이내 식별 연결 제거. 대사용 잔여 기록은 재식별 불가능한 형태로 최대 1년 보관 후 익명화 또는 삭제</td></tr>
              <tr><th scope="row">정책 확인</th><td>문서 종류·버전·해시, 확인·동의 시각, 만 14세 이상 확인</td><td>동의 증명, 정책 버전 관리</td><td>탈퇴 후 3년</td></tr>
              <tr><th scope="row">접속·활동·보안 감사</th><td>내부 사용자 ID, 접속·요청 시각, 페이지·API 경로, HTTP 메서드, 응답 상태, 처리시간, 요청 ID, 버튼 클릭·페이지 체류 이벤트, 접속 IP 주소 또는 축약 네트워크, 브라우저·운영체제 정보. 쿠키·세션 토큰·요청 본문과 URL 검색값은 기록하지 않음</td><td>서비스 안정성 확인, 장애·보안사고 대응, 권한 통제, 부정 이용 조사</td><td>일반 접속·활동 및 인증·권한 거부 기록 90일, 관리자·경제 감사 기록 1년</td></tr>
              <tr><th scope="row">실시간 로비</th><td>이용자가 전송한 메시지</td><td>접속 중인 이용자에게 실시간 전달</td><td>서버 DB에 저장하지 않으며 연결 종료 시 처리 종료</td></tr>
              <tr><th scope="row">프로필·갤러리 사진</th><td>이용자가 선택한 이미지 파일, 저장 키, 설명문, 공개 범위, 제출·검토 상태 및 연결된 내부 사용자 ID</td><td>프로필 표시, 갤러리 제출·운영 검토, 권한에 따른 이미지 제공, 악성·권리침해 콘텐츠 대응</td><td>이용자가 삭제하거나 탈퇴할 때까지. 삭제·탈퇴 요청이 접수되면 공개 접근을 즉시 차단하고 파일·메타데이터를 30일 이내 삭제합니다. 법령상 보존 또는 분쟁·보안 조사가 필요한 경우에는 그 사유가 끝날 때까지 분리 보관합니다.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section id="privacy-sharing">
        <h2>2. 제3자 제공, 위탁 및 국외 이전</h2>
        <p>서비스는 이용자의 개인정보를 외부에 판매하거나 무단 제공하지 않습니다. 서비스 운영에 필수적인 외부 인프라 위탁은 최소한으로 유지합니다.</p>
      </section>
      <section id="privacy-cookies">
        <h2>3. 쿠키와 세션</h2>
        <p>로그인 상태 유지를 위한 필수 세션 쿠키를 사용하며, 외부 광고 제공 시 구글 애드센스 쿠키가 적용될 수 있습니다.</p>
      </section>
      <section id="privacy-rights">
        <h2>4. 이용자의 권리와 행사 방법</h2>
        <p>이용자는 언제든지 자신의 개인정보 열람, 정정 및 회원 탈퇴(삭제)를 요구할 수 있습니다.</p>
      </section>
      <section id="privacy-contact">
        <h2>5. 개인정보 보호책임자와 문의처</h2>
        <p>개인정보 보호책임자: 홍종환 (<a href="mailto:jungchwimisaenghwal63@gmail.com">jungchwimisaenghwal63@gmail.com</a>)</p>
      </section>
    </article>
  );
}
