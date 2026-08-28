import Link from 'next/link';

/**
 * The published Terms, carried across from the original view verbatim.
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
export function TermsDocument() {
  return (
      <article className="policy-document grid gap-6">
      <p className="eyebrow">WOLDEOK MONEYVERSE · TEST POLICY</p>
      <p className="max-w-prose text-sm text-muted-foreground">
      월덕 머니버스는 Discord와 웹에서 함께 사용하는 커뮤니티형 가상경제 서비스입니다.
      이 문서는 테스트 서버에서 적용할 MVP 이용 기준을 분명히 설명합니다.
      </p>
      <dl className="grid gap-2 rounded-lg border bg-card p-4 text-sm sm:grid-cols-3" aria-label="문서 정보">
      <div><dt>문서 버전</dt><dd>2026-08-26</dd></div>
      <div><dt>시행일</dt><dd>2026년 8월 26일</dd></div>
      <div><dt>문서 상태</dt><dd>테스트 서버 적용본</dd></div>
      </dl>
      <aside className="rounded-lg border-l-4 border-l-primary bg-card p-4" aria-label="중요 안내">
      <strong>가상경제 안내</strong>
      <p>서비스 안의 화폐·아이템·잔액·보상은 게임 안에서만 쓰는 가상 데이터입니다. 현금 환전, 출금, 실제 투자 수익, 실제 금융상품 또는 외부 재화의 구매수단을 제공하지 않습니다.</p>
      </aside>
      <section className="grid gap-2" aria-labelledby="terms-summary-title">
      <p className="eyebrow">먼저 확인하세요</p>
      <h2 id="terms-summary-title">서비스 이용의 세 가지 기준</h2>
      <ul>
      <li>만 14세 이상만 이용할 수 있습니다. 법정대리인 동의 절차가 준비되기 전까지 만 14세 미만 가입은 허용하지 않습니다.</li>
      <li>모든 가치 변동은 경제 원장에 기록됩니다. 오류·부정 이용·보안 사고는 기록을 근거로 조사·정정될 수 있습니다.</li>
      <li>계정 공유, 현금 거래, 자동화·취약점 악용, 타인이나 서버 운영을 해치는 행동은 허용하지 않습니다.</li>
      </ul>
      </section>
      <nav className="rounded-lg border bg-card p-4 text-sm" aria-label="이용약관 목차">
      <p>목차</p>
      <ol>
      <li><a href="#terms-purpose">목적과 적용</a></li>
      <li><a href="#terms-eligibility">이용 자격과 계정</a></li>
      <li><a href="#terms-economy">가상경제와 거래</a></li>
      <li><a href="#terms-conduct">이용자 의무와 금지 행위</a></li>
      <li><a href="#terms-operation">운영·제한·서비스 변경</a></li>
      <li><a href="#terms-withdrawal">탈퇴·책임·문의</a></li>
      </ol>
      </nav>
      <section id="terms-purpose">
      <h2>제1조 목적과 적용</h2>
      <p>이 약관은 월덕 머니버스(이하 “서비스”)가 웹과 Discord에서 제공하는 커뮤니티형 가상경제·게임 기능의 이용 조건, 이용자와 운영자의 권리와 의무, 책임 및 분쟁 처리 기준을 정합니다.</p>
      <p>이 약관은 서비스의 홈페이지, 지갑, 거래내역, 보상, 상점, 커뮤니티 기능, Discord 봇 및 권한이 부여된 운영 기능에 적용됩니다. 개인정보의 처리에 관한 사항은 <Link href="/privacy">개인정보처리방침</Link>을 따릅니다.</p>
      </section>
      <section id="terms-eligibility">
      <h2>제2조 이용 자격과 계정</h2>
      <ol>
      <li>이용자는 이 약관과 개인정보처리방침 전문을 확인하고, 필수 확인·동의 및 만 14세 이상 확인을 완료한 뒤 Discord 또는 Google 로그인으로 서비스를 이용할 수 있습니다.</li>
      <li>만 14세 미만 이용자는 법정대리인 동의와 확인 절차가 마련되기 전까지 가입하거나 개인정보를 제공할 수 없습니다.</li>
      <li>이용자는 자신의 연령과 계정 정보가 정확하다는 것을 확인해야 합니다. 허위 연령정보, 타인 계정 사용, 계정 양도·대여가 확인되면 서비스는 필요한 범위에서 이용을 제한하거나 계정을 삭제할 수 있습니다.</li>
      <li>하나의 Discord 또는 Google 계정은 하나의 내부 사용자 계정에만 연결할 수 있습니다. 이미 다른 이용자에게 연결된 외부 계정은 자동으로 병합하지 않습니다.</li>
      <li>계정 연결·해제, 탈퇴, 관리자 권한 변경과 같은 민감 작업에는 최근 로그인 확인 또는 추가 인증을 요구할 수 있습니다.</li>
      </ol>
      </section>
      <section id="terms-economy">
      <h2>제3조 가상경제와 거래</h2>
      <ol>
      <li>서비스 안의 화폐, 잔액, 아이템, 보상, 거래내역 및 순위는 게임 안에서만 사용하는 가상 데이터이며, 현금·증권·예금·투자상품 또는 환전 가능한 자산이 아닙니다.</li>
      <li>모든 잔액 변동은 서비스의 경제 원장을 통해 처리됩니다. 화면 표시나 클라이언트 요청만으로는 잔액을 바꾸거나 거래를 확정할 수 없습니다.</li>
      <li>송금, 보상, 상점 구매 등은 거래 영수증과 원장 기록을 기준으로 처리합니다. 같은 요청을 여러 번 보내도 동일한 멱등성 키를 가진 거래는 한 번만 처리되어야 합니다.</li>
      <li>명백한 오류, 보안 사고, 부정 이용 또는 약관 위반이 확인되면 서비스는 원장과 감사 기록을 근거로 거래를 조사·보류·정정·취소할 수 있습니다. 경제에 영향을 주는 운영자 조정은 사유, 대상, 거래 ID 및 승인 기록을 남깁니다.</li>
      <li>가상 데이터의 현금화, 외부 자산과의 교환, 대가를 받는 양도·알선·광고는 허용하지 않습니다.</li>
      </ol>
      </section>
      <section id="terms-conduct">
      <h2>제4조 이용자 의무와 금지 행위</h2>
      <p>이용자는 다른 이용자의 안전과 서비스의 안정성을 위해 다음 행위를 해서는 안 됩니다.</p>
      <ul>
      <li>타인의 계정·세션·개인정보를 이용·취득하거나 로그인 수단을 공유하는 행위</li>
      <li>자동화 도구, 봇, 스크립트, 취약점, 비정상 요청으로 보상·화폐·아이템을 얻거나 서비스 운영을 방해하는 행위</li>
      <li>Discord, 웹, 마인크래프트 서버 또는 관리자 기능의 접근 통제·권한 체계를 우회하는 행위</li>
      <li>욕설, 협박, 차별, 성적·불법 콘텐츠, 타인의 권리 침해 콘텐츠를 전송하거나 게시하는 행위</li>
      <li>광고 클릭 유도, 허위 트래픽, 피싱, 사칭, 악성코드 배포 또는 법령을 위반하는 행위</li>
      </ul>
      <p>실시간 로비 메시지는 접속 중인 다른 이용자에게 보일 수 있습니다. 비밀번호, 인증코드, 실제 금융정보, 주소·연락처 등 개인 정보를 메시지에 게시하지 마세요.</p>
      </section>
      <section id="terms-operation">
      <h2>제5조 운영 기능과 이용 제한</h2>
      <ol>
      <li>마인크래프트 서버 관리 기능은 서버 운영자 역할을 부여받은 사람에게만 제공됩니다. 상태 확인, 시작, 안전 종료, 재시작, 로그 조회처럼 사전에 정한 작업만 허용하며 임의 콘솔 명령 전달은 제공하지 않습니다.</li>
      <li>운영자·승인 관리자 권한은 최소 권한 원칙, 역할 검증, 감사 기록 및 필요한 경우 2인 승인 절차에 따라 사용됩니다.</li>
      <li>약관 위반, 보안 위협, 부정 이용 또는 다른 이용자 보호가 필요한 경우 서비스는 경고, 기능 제한, 거래 보류, 계정 제한 또는 삭제 조치를 할 수 있습니다.</li>
      <li>긴급한 보안 대응이나 피해 확산 방지가 필요한 경우를 제외하고, 서비스는 가능한 범위에서 조치 사유와 이의제기 방법을 알립니다. 이의가 있는 이용자는 운영 문의 창구에 거래 영수증과 사실관계를 제출할 수 있습니다.</li>
      </ol>
      </section>
      <section>
      <h2>제6조 서비스 변경과 중단</h2>
      <ol>
      <li>서비스는 보안, 안정성, 법령 준수, 경제 균형 또는 기능 개선을 위해 일부 기능을 변경·중단할 수 있습니다.</li>
      <li>경제 정책의 중요한 변경은 버전, 적용일, 변경 사유 및 예상 영향을 공지하고 승인·감사 절차를 거칩니다.</li>
      <li>정기 점검, 장애 대응 또는 제3자 서비스 장애가 발생할 수 있으며, 서비스는 가능한 한 사전 또는 사후에 안내합니다.</li>
      </ol>
      </section>
      <section>
      <h2>제7조 약관의 변경</h2>
      <ol>
      <li>서비스는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있습니다.</li>
      <li>일반 변경은 시행 7일 전, 이용자에게 불리하거나 중요한 변경은 시행 30일 전부터 변경 내용·사유·시행일을 공지합니다.</li>
      <li>이용자의 권리에 큰 영향을 주는 변경 또는 필수 개인정보 처리 내용의 변경은 다음 로그인 전에 새 문서를 다시 확인하도록 합니다.</li>
      </ol>
      </section>
      <section id="terms-withdrawal">
      <h2>제8조 탈퇴, 책임과 문의</h2>
      <ol>
      <li>이용자는 서비스가 제공하는 탈퇴 절차로 계정 삭제를 요청할 수 있습니다. 탈퇴 뒤 개인정보와 가상경제 기록의 처리·보존·익명화는 개인정보처리방침을 따릅니다.</li>
      <li>서비스는 고의 또는 중대한 과실이 없는 한 무료 가상경제 서비스 이용에서 발생한 간접적·특별한 손해에 책임을 지지 않습니다. 다만 관련 법령에서 달리 정한 경우에는 그 법령을 따릅니다.</li>
      <li>이 약관은 대한민국 법령을 따르며, 분쟁은 법령상 관할 법원에서 해결합니다.</li>
      </ol>
      </section>
      <aside className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground" aria-label="테스트 문서 고지">
      <strong>테스트 서버 고지</strong>
      <p>이 문서는 실제 기능·데이터 흐름에 맞춘 테스트용 정책 전문입니다. 운영 전에는 운영자 신원, 검증된 문의 연락처, 실제 수탁사·국외 이전 여부와 최종 보유 기간을 확정해 재게시하고, 중요한 변경은 다시 동의를 받아야 합니다.</p>
      </aside>
      </article>
  );
}
