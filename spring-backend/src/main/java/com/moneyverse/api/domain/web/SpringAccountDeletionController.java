package com.moneyverse.api.domain.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

/**
 * Read-only Spring MVC candidate for the existing Next.js /account-deletion page.
 * This is intentionally noncanonical and opt-in: existing Next routes remain live owners.
 */
@Controller
@ConditionalOnProperty(prefix = "moneyverse.web", name = "account-deletion-preview-enabled", havingValue = "true")
public final class SpringAccountDeletionController {
    private static final String VIEW = "spring-web/account-deletion";

    private static final Map<String, String> EN = Map.ofEntries(
            Map.entry("title", "Account deletion request"),
            Map.entry("summary", "How to request deletion of your Woldeok Moneyverse account and related data."),
            Map.entry("home", "Home"),
            Map.entry("status", "Service status"),
            Map.entry("skip", "Skip to content"),
            Map.entry("serviceTitle", "Covered service"),
            Map.entry("appLabel", "App"),
            Map.entry("operatorLabel", "Operator and developer"),
            Map.entry("stepsTitle", "How to request account deletion"),
            Map.entry("step1Before", "After signing in, open "),
            Map.entry("accountLink", "My account"),
            Map.entry("step1After", "."),
            Map.entry("step2", "Review the account-deletion section and submit a deletion request."),
            Map.entry("step3Before", "If you cannot sign in, send a request from the email address you registered with to "),
            Map.entry("step3After", "."),
            Map.entry("secretWarning", "Do not send passwords, verification codes, session tokens or other secrets by email. Minimal additional verification may be requested to confirm ownership."),
            Map.entry("retentionTitle", "Deletion and retention"),
            Map.entry("retention1", "OAuth connections and profile identifiers: delete within 30 days after account closure."),
            Map.entry("retention2", "Profile and gallery photos: block public access upon receiving the request; delete files and metadata within 30 days."),
            Map.entry("retention3", "Internal account and virtual-economy records: remove identity links within 30 days after closure. Residual reconciliation records may be kept without reidentification for up to one year, then anonymized or deleted."),
            Map.entry("retention4", "Consent proof may be retained for three years after closure; general access/authentication records for 90 days; administrator/economy audit records for up to one year."),
            Map.entry("exception", "Where law, a dispute, or a security investigation requires preservation, only necessary information is kept separately and deleted when the reason ends."),
            Map.entry("privacyBefore", "Read the detailed "),
            Map.entry("privacyLink", "Privacy Policy"),
            Map.entry("privacyAfter", "."),
            Map.entry("preview", "Spring frontend migration preview. The live account-deletion page and submission process have not been replaced.")
    );

    private static final Map<String, String> KO = Map.ofEntries(
            Map.entry("title", "계정 삭제 요청"),
            Map.entry("summary", "월덕 머니버스 계정 및 관련 데이터 삭제 요청 방법과 보관 기준"),
            Map.entry("home", "홈"),
            Map.entry("status", "서비스 상태"),
            Map.entry("skip", "본문으로 건너뛰기"),
            Map.entry("serviceTitle", "대상 서비스"),
            Map.entry("appLabel", "앱"),
            Map.entry("operatorLabel", "운영자·개발자"),
            Map.entry("stepsTitle", "계정 삭제 요청 방법"),
            Map.entry("step1Before", "로그인 후 "),
            Map.entry("accountLink", "내 계정"),
            Map.entry("step1After", "으로 이동합니다."),
            Map.entry("step2", "계정 삭제 영역에서 안내를 확인하고 삭제 요청을 제출합니다."),
            Map.entry("step3Before", "로그인할 수 없으면 가입에 사용한 이메일 주소에서 "),
            Map.entry("step3After", "으로 요청할 수 있습니다."),
            Map.entry("secretWarning", "이메일 요청 시 비밀번호, 인증번호, 세션 토큰 등 비밀정보를 보내지 마세요. 본인 확인을 위해 최소한의 추가 확인을 요청할 수 있습니다."),
            Map.entry("retentionTitle", "삭제 및 보관 기준"),
            Map.entry("retention1", "OAuth 연결 정보와 프로필 식별정보: 탈퇴 처리 후 30일 이내 삭제."),
            Map.entry("retention2", "프로필·갤러리 사진: 요청 접수 시 공개 접근을 차단하고 파일·메타데이터를 30일 이내 삭제."),
            Map.entry("retention3", "내부 계정·가상경제 기록: 탈퇴 후 30일 이내 식별 연결을 제거하고, 대사에 필요한 잔여 기록은 재식별 불가능한 형태로 최대 1년 보관 후 익명화 또는 삭제."),
            Map.entry("retention4", "정책 동의 증명은 탈퇴 후 3년, 일반 접속·인증 기록은 90일, 관리자·경제 감사 기록은 최대 1년 보관될 수 있습니다."),
            Map.entry("exception", "법령상 보존 의무, 분쟁 또는 보안 조사로 즉시 삭제할 수 없는 정보는 필요한 범위에서 분리 보관한 뒤 사유가 끝나면 삭제합니다."),
            Map.entry("privacyBefore", "상세 기준은 "),
            Map.entry("privacyLink", "개인정보처리방침"),
            Map.entry("privacyAfter", "에서 확인할 수 있습니다."),
            Map.entry("preview", "Spring 웹 전환 미리보기입니다. 현재 운영 중인 계정 삭제 화면과 접수 기능은 교체하지 않았습니다.")
    );

    @GetMapping("/spring-web/account-deletion")
    public String accountDeletion(@RequestParam(name = "lang", required = false) String lang,
                                  Model model, HttpServletResponse response) {
        return render(lang, model, response, true);
    }

    static String render(String lang, Model model, HttpServletResponse response, boolean preview) {
        // Only the explicit Korean code is selected; all other inputs use English.
        boolean korean = "ko".equalsIgnoreCase(lang);
        response.setHeader("Cache-Control", "private, no-store");
        if (preview) {
            response.setHeader("X-Robots-Tag", "noindex, nofollow");
        }
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Content-Security-Policy",
                "default-src 'none'; style-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'");
        model.addAttribute("lang", korean ? "ko" : "en");
        model.addAttribute("preview", preview);
        model.addAttribute("homePath", preview ? "/spring-web" : "/");
        model.addAttribute("deletionPath", preview ? "/spring-web/account-deletion" : "/account-deletion");
        model.addAttribute("brand", korean ? "월덕 머니버스" : "Woldeok Moneyverse");
        model.addAttribute("copy", korean ? KO : EN);
        return VIEW;
    }
}
