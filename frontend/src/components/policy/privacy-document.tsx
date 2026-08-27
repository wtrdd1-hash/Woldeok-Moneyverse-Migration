import Link from 'next/link';

/**
 * The published Privacy, carried across from the original view verbatim.
 *
 * The Korean text is the product's own and is byte-identical to what the
 * Express application served — a policy document is a legal artefact whose
 * wording is not a rewrite's to improve. Only the markup was re-expressed:
 * the original's stylesheet classes became theme utilities, and internal
 * links became router links.
 *
 * Prose, not data, so it is not built from the registry's Table and Card.
 * Those describe an application's controls; this is a document, and it is
 * styled by the `.policy-document` rules in globals.css instead.
 */
export function PrivacyDocument() {
  return (
      <article className="policy-document grid gap-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">WOLDEOK MONEYVERSE · TEST POLICY</p>
      <p className="max-w-prose text-sm text-muted-foreground">
      월덕 머니버스는 로그인, 가상경제 원장, 보안에 필요한 정보만 최소한으로 처리합니다.
      무엇을 왜 처리하고 언제 지우는지 테스트 서버 기준으로 공개합니다.
      </p>
      <dl className="grid gap-2 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3" aria-label="문서 정보">
      <div><dt>문서 버전</dt><dd>2026-08-26</dd></div>
      <div><dt>시행일</dt><dd>2026년 8월 26일</dd></div>
      <div><dt>문서 상태</dt><dd>테스트 서버 적용본</dd></div>
      </dl>
      <aside className="rounded-lg border-l-4 border-l-primary bg-card p-4" aria-label="핵심 개인정보 원칙">
      <strong>핵심 원칙</strong>
      <p>OAuth 접근·갱신 토큰과 Google 이메일은 장기 저장하지 않습니다. 일반 익명 방문자의 IP를 앱 데이터베이스에 저장하지 않으며, 광고·분석·마케팅 쿠키는 현재 사용하지 않습니다.</p>
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
      <p>서비스는 서비스 제공에 필요한 최소한의 정보만 처리합니다. 아래 기간은 현재 테스트 서버의 MVP 기준이며, 실제 운영 전에는 데이터 흐름·법령상 보존 의무·최종 운영 정책을 확인해 확정합니다.</p>
      <div className="overflow-x-auto rounded-lg border" tabIndex={0} aria-label="개인정보 처리 항목 표는 가로로 스크롤할 수 있습니다.">
      <table>
      <thead>
      <tr><th scope="col">구분</th><th scope="col">처리 항목</th><th scope="col">처리 목적</th><th scope="col">테스트 기준 보유 기간</th></tr>
      </thead>
      <tbody>
      <tr><th scope="row">OAuth 로그인</th><td>로그인 제공자, 제공자 고유 식별자, 표시명</td><td>로그인, 내부 계정 생성·연결, 중복 연결 방지, 계정 보호</td><td>탈퇴 처리 후 30일 이내 삭제</td></tr>
      <tr><th scope="row">내부 계정·가상경제</th><td>내부 사용자 ID, 계정 상태, 지갑·잔액, 송금·보상·구매·거래 기록</td><td>가상경제 제공, 거래 영수증, 부정 이용 방지, 원장 대사</td><td>탈퇴 후 30일 이내 식별 연결 제거. 대사용 잔여 기록은 재식별 불가능한 형태로 최대 1년 보관 후 익명화 또는 삭제</td></tr>
      <tr><th scope="row">정책 확인</th><td>문서 종류·버전·해시, 확인·동의 시각, 만 14세 이상 확인</td><td>동의 증명, 정책 버전 관리</td><td>탈퇴 후 3년</td></tr>
      <tr><th scope="row">보안·감사</th><td>내부 사용자 ID, 요청 ID, 작업 종류·결과·시각, 권한 변경·관리 작업 기록</td><td>보안사고 대응, 권한 통제, 부정 이용 조사</td><td>인증·권한 거부 기록 90일, 관리자·경제 감사 기록 1년</td></tr>
      <tr><th scope="row">실시간 로비</th><td>이용자가 전송한 메시지</td><td>접속 중인 이용자에게 실시간 전달</td><td>서버 DB에 저장하지 않으며 연결 종료 시 처리 종료</td></tr>
      </tbody>
      </table>
      </div>
      <p>서비스는 OAuth 접근 토큰·갱신 토큰·Google 이메일을 장기 저장하지 않습니다. 현재 일반 이용자의 사진 업로드, 개인화 광고, 마케팅 수신 기능은 제공하지 않습니다.</p>
      </section>
      <section>
      <h2>2. 처리 근거와 필수 확인</h2>
      <p>계정 생성·인증·가상경제 제공에 필요한 정보는 이용계약의 체결과 이행을 위해 처리합니다. 보안과 부정 이용 방지에 필요한 최소 정보는 관련 법령과 정당한 운영 목적에 따라 처리합니다.</p>
      <p>이용약관 동의, 개인정보처리방침 확인, 만 14세 이상 확인은 각각 분리하여 받습니다. 선택 동의, 마케팅 수신 동의, 개인화 광고 동의는 현재 요구하거나 미리 선택하지 않습니다. 필수 처리에 필요한 확인을 하지 않으면 로그인과 서비스 이용이 제한됩니다.</p>
      </section>
      <section id="privacy-sharing">
      <h2>3. 제3자 제공, 처리위탁과 국외 이전</h2>
      <h3>제3자 제공</h3>
      <p>서비스는 이용자 개인정보를 판매하거나 광고 타기팅 목적으로 제공하지 않습니다. 현재 서비스가 이용자 개인정보를 제3자에게 제공하는 기능은 없습니다.</p>
      <h3>외부 로그인</h3>
      <p>이용자가 Discord 또는 Google 로그인을 선택하면 이용자의 브라우저는 해당 로그인 제공자와 직접 통신합니다. 서비스는 로그인에 필요한 제공자 고유 식별자와 표시명만 받아 처리하며, Discord와 Google의 개인정보 처리는 각 제공자의 정책에 따릅니다.</p>
      <h3>위탁·국외 이전의 운영 전 확인</h3>
      <p>서비스는 실제 활성화된 인프라에 한해 네트워크 보안·역프록시·호스팅 제공자에게 처리 업무를 위탁할 수 있습니다. Cloudflare 같은 해외 인프라 또는 해외 OAuth 제공자를 실제 사용하게 되는 경우, 운영 전 제공받는 자, 이전 국가, 이전 항목, 이전 일시·방법, 이용 목적, 보유 기간 및 거부 방법을 실제 구성에 맞게 이 방침에 공개합니다.</p>
      <p>그 정보가 확정·게시되기 전에는 국외 이전이 수반되는 운영 기능을 활성화하지 않습니다.</p>
      </section>
      <section id="privacy-cookies">
      <h2>4. 쿠키와 세션</h2>
      <p>서비스는 로그인 유지를 위한 필수 세션 쿠키와 서버가 발급한 요청 위조 방지 확인값만 사용합니다.</p>
      <div className="overflow-x-auto rounded-lg border" tabIndex={0} aria-label="쿠키와 보안 확인값 표는 가로로 스크롤할 수 있습니다.">
      <table>
      <thead><tr><th scope="col">이름</th><th scope="col">목적</th><th scope="col">보유 기간</th><th scope="col">보호 방식</th></tr></thead>
      <tbody>
      <tr><th scope="row">mv_session</th><td>서버 세션 식별, 로그인과 보안 유지</td><td>최대 8시간 또는 로그아웃·폐기 시까지</td><td>HttpOnly, Secure, SameSite 속성 적용</td></tr>
      <tr><th scope="row">CSRF 확인값</th><td>상태 변경 요청 위조 방지</td><td>최대 8시간 또는 세션 폐기 시까지</td><td>쿠키로 장기 저장하지 않고, 로그인·지갑 화면에서 전달한 값을 서버에서 검증</td></tr>
      </tbody>
      </table>
      </div>
      <p>현재 분석·추적·광고 쿠키는 사용하지 않습니다. 광고 또는 분석 도구를 도입할 경우 적용 전에 실제 기능에 맞는 고지와 필요한 선택 절차를 제공하겠습니다.</p>
      </section>
      <section>
      <h2>5. 파기와 탈퇴</h2>
      <p>보유 기간이 끝나거나 처리 목적을 달성하면 개인정보를 지체 없이 복구할 수 없는 방법으로 삭제합니다. 대사·보안 목적상 제한 보관이 필요한 정보는 다른 정보와 분리하고, 위 표의 기간이 끝나면 재식별 연결을 제거해 익명화하거나 삭제합니다.</p>
      <p>이용자가 탈퇴를 요청하면 활성 세션을 폐기하고 OAuth 연결 정보와 프로필 식별정보를 삭제 절차에 따라 처리합니다. 이미 확정된 가상경제 원장은 이중분개 대사를 위해 식별 연결을 제거한 상태로 제한 보관될 수 있습니다.</p>
      </section>
      <section id="privacy-rights">
      <h2>6. 이용자의 권리와 행사 방법</h2>
      <p>이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지, 동의 철회, 계정 탈퇴를 요청할 수 있습니다. 로그인한 이용자는 <Link href="/account#privacy-requests">내 계정의 개인정보 요청 메뉴</Link>에서 요청 종류와 처리에 필요한 최소 설명을 접수 기록으로 남길 수 있습니다.</p>
      <p>이 메뉴는 요청을 기록하는 기능이며 데이터 내보내기·이메일 발송·즉시 처리 완료를 약속하지 않습니다. 서비스는 본인 확인과 운영 절차를 거쳐 관련 법령이 허용하는 범위에서 처리하고, 거절 또는 제한이 필요한 경우 사유를 알립니다. 탈퇴와 삭제 요청은 원장 대사·부정 이용 조사·법령상 보존 필요 범위에 따라 일부 기록의 즉시 삭제가 제한될 수 있습니다.</p>
      </section>
      <section>
      <h2>7. 안전성 확보 조치</h2>
      <p>서비스는 HTTPS 전송구간 보호, 접근권한 최소화, 서버 측 세션 관리, CSRF 방어, 입력 검증, 감사 기록, 비밀값 분리, 데이터베이스 권한 분리와 백업·복구 점검을 적용합니다. 비밀번호, OAuth 토큰, 세션 토큰, 데이터베이스 연결정보와 같은 비밀값은 로그와 감사기록에 남기지 않습니다.</p>
      </section>
      <section>
      <h2>8. 만 14세 미만 아동의 개인정보</h2>
      <p>서비스는 법정대리인 동의·확인 절차가 마련되기 전까지 만 14세 미만 아동의 가입과 개인정보 처리를 허용하지 않습니다. 만 14세 미만으로 확인되는 계정은 필요한 범위에서 이용을 중지하고 삭제 절차를 진행합니다.</p>
      </section>
      <section id="privacy-contact">
      <h2>9. 문의, 피해 구제와 방침 변경</h2>
      <p>개인정보 처리 관련 문의, 불만, 열람·삭제 요청은 서비스의 개인정보 문의 창구로 보낼 수 있습니다. 실제 운영 전에는 개인정보보호 담당 부서명과 검증된 이메일 또는 전화번호를 이 자리에 확정해 게시합니다.</p>
      <p>외부 도움이나 신고가 필요한 경우 <a href="https://privacy.kisa.or.kr/" rel="noopener noreferrer" target="_blank">개인정보침해 신고센터</a> 118 또는 <a href="https://www.privacy.go.kr/" rel="noopener noreferrer" target="_blank">개인정보분쟁조정위원회</a> 1833-6972를 이용할 수 있습니다.</p>
      <p>이 방침의 내용 추가·삭제·수정이 있을 경우 시행 7일 전부터 공지합니다. 이용자 권리에 중대한 영향을 주거나 처리 범위를 확대하는 변경은 시행 30일 전부터 알리고, 필요한 경우 새 동의를 받습니다. 변경 이력은 버전·시행일·변경 요약으로 공개합니다.</p>
      </section>
      <aside className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground" aria-label="테스트 문서 고지">
      <strong>테스트 서버 고지</strong>
      <p>이 문서는 테스트 환경의 실제 데이터 최소화 원칙과 목표 보유 기간을 설명합니다. 실사용자 정보를 받는 운영 환경에서는 운영자·보호책임자 연락처, 실제 수탁사·국외 이전 정보, 최종 보유 기간을 확정한 뒤 이 문서를 갱신해야 합니다.</p>
      </aside>
      </article>
  );
}
