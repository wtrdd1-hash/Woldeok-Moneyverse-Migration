package com.moneyverse.api.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.ui.Model;

import java.util.List;

/** Read-only localized UI model. Does not access sessions, credentials, or finance state. */
final class SpringGuidePageSupport {
    private SpringGuidePageSupport() { }

    record Card(String title, String description, String path) { }

    static String render(String requestedLanguage, boolean preview, Model model, HttpServletResponse response) {
        boolean korean = "ko".equalsIgnoreCase(requestedLanguage);
        String language = korean ? "ko" : "en";
        model.addAttribute("language", language);
        model.addAttribute("preview", preview);
        model.addAttribute("metaDescription", korean ? "가상경제의 직업, 가상 지갑, 주식, 계산기 및 커뮤니티 기능 안내." : "Learn about virtual-economy activities, wallets, stocks, calculators and community features.");
        model.addAttribute("skipLabel", korean ? "본문으로 이동" : "Skip to content");
        model.addAttribute("pageTitle", korean ? "서비스 안내 | 월덕 머니버스" : "Service guide | Woldeok Moneyverse");
        model.addAttribute("heading", korean ? "머니버스에서 할 수 있는 일" : "Explore Woldeok Moneyverse");
        model.addAttribute("introduction", korean
                ? "일하고, 배우고, 가상의 자산을 관리하는 커뮤니티 경제 시뮬레이터입니다."
                : "Learn, work and explore a community-based virtual economy.");
        model.addAttribute("virtualOnly", korean
                ? "WLD, 가상 주식, 게임 보상은 서비스 내 가상 데이터이며 실제 돈이나 금융상품이 아닙니다."
                : "WLD, simulated stocks and game rewards are virtual in-service values, not real money or financial products.");
        model.addAttribute("homeLabel", korean ? "홈" : "Home");
        model.addAttribute("guideLabel", korean ? "서비스 안내" : "Guide");
        model.addAttribute("privacyLabel", korean ? "개인정보처리방침" : "Privacy");
        model.addAttribute("termsLabel", korean ? "이용약관" : "Terms");
        model.addAttribute("exploreLabel", korean ? "기능 살펴보기" : "Explore features");
        model.addAttribute("languageLabel", korean ? "언어" : "Language");
        model.addAttribute("cards", korean ? List.of(
                new Card("직업과 퀘스트", "활동 목표, 진행 상태 및 보상 기록을 확인하세요.", "/work"),
                new Card("가상 지갑", "가상 WLD 거래 및 자산 내역을 확인하세요.", "/wallet"),
                new Card("가상 주식", "시뮬레이션 시장과 포트폴리오를 살펴보세요.", "/stocks"),
                new Card("계산기", "금융 학습용 계산기를 사용해 보세요.", "/calculators"),
                new Card("커뮤니티", "공지사항과 게시판을 방문하세요.", "/board"),
                new Card("도움말", "도움이 필요하면 지원 페이지로 이동하세요.", "/support")
        ) : List.of(
                new Card("Jobs & quests", "Explore tasks, progress and reward history.", "/work"),
                new Card("Virtual wallet", "Review your virtual WLD activity and balances.", "/wallet"),
                new Card("Simulated stocks", "Explore markets and a virtual portfolio.", "/stocks"),
                new Card("Calculators", "Use learning-oriented financial calculators.", "/calculators"),
                new Card("Community", "Read announcements and community discussions.", "/board"),
                new Card("Support", "Find help and contact the support team.", "/support")
        ));
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
        if (preview) {
            response.setHeader("Cache-Control", "no-store, private");
            response.setHeader("X-Robots-Tag", "noindex, nofollow");
        } else {
            response.setHeader("Cache-Control", "public, max-age=60");
        }
        return "spring-guide";
    }
}
