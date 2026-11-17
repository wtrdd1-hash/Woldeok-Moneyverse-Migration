package com.moneyverse.api.web;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.ui.Model;

import java.util.List;

/** Guest-facing Spring MVC read-only page model. No synthetic balances or account state. */
final class SpringHomePageSupport {
    private SpringHomePageSupport() { }

    record Tile(String name, String body, String path, String symbol) { }

    static String render(String requestedLanguage, boolean preview, Model model, HttpServletResponse response) {
        boolean korean = "ko".equalsIgnoreCase(requestedLanguage);
        model.addAttribute("language", korean ? "ko" : "en");
        model.addAttribute("preview", preview);
        model.addAttribute("pageTitle", korean ? "월덕 머니버스 — 가상경제 시뮬레이터" : "Woldeok Moneyverse — Virtual economy simulator");
        model.addAttribute("pageDescription", korean ? "직업, 퀘스트, 가상 주식, 금융 계산기를 탐색하는 커뮤니티 경제 시뮬레이터." : "Explore virtual jobs, quests, stocks and learning-oriented financial calculators.");
        model.addAttribute("skipLabel", korean ? "본문으로 이동" : "Skip to content");
        model.addAttribute("guideLabel", korean ? "서비스 안내" : "Guide");
        model.addAttribute("heading", korean ? "배우고, 도전하고, 성장하는 가상경제" : "Learn, explore and grow in a virtual economy");
        model.addAttribute("intro", korean ? "가상의 WLD 경제에서 활동을 시작하고, 금융 개념을 익혀 보세요." : "Discover activities and financial concepts in a virtual WLD economy.");
        model.addAttribute("startLabel", korean ? "활동 살펴보기" : "Explore activities");
        model.addAttribute("calculateLabel", korean ? "금융 계산기" : "Financial calculators");
        model.addAttribute("sectionTitle", korean ? "무엇을 해볼까요?" : "What would you like to try?");
        model.addAttribute("virtualOnly", korean ? "이 서비스의 WLD, 주식, 도박형 미니게임은 가상 시뮬레이션으로 실제 돈·금융투자·도박이 아닙니다." : "WLD, stocks and chance-based minigames are simulations, not real money, securities or gambling.");
        model.addAttribute("termsLabel", korean ? "이용약관" : "Terms");
        model.addAttribute("privacyLabel", korean ? "개인정보처리방침" : "Privacy");
        model.addAttribute("tiles", korean ? List.of(
                new Tile("일과 퀘스트", "새로운 활동과 주간 목표를 탐색하세요.", "/work", "✦"),
                new Tile("가상 주식", "시뮬레이션 시장의 개념을 경험하세요.", "/stocks", "▤"),
                new Tile("가상 지갑", "로그인 후 자신의 가상 활동을 확인하세요.", "/wallet", "◇"),
                new Tile("금융 계산기", "복리·대출 등 다양한 계산을 학습하세요.", "/calculators", "∑"),
                new Tile("커뮤니티", "게시판과 공지사항을 살펴보세요.", "/board", "◎"),
                new Tile("지원 센터", "도움말과 문의 방법을 확인하세요.", "/support", "?")
        ) : List.of(
                new Tile("Jobs & quests", "Explore new activities and weekly goals.", "/work", "✦"),
                new Tile("Virtual stocks", "Learn with a simulated stock market.", "/stocks", "▤"),
                new Tile("Virtual wallet", "Sign in to review your own virtual activity.", "/wallet", "◇"),
                new Tile("Calculators", "Learn about compounding, loans and more.", "/calculators", "∑"),
                new Tile("Community", "Browse discussions and announcements.", "/board", "◎"),
                new Tile("Support", "Find help and ways to get in touch.", "/support", "?")
        ));
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
        if (preview) {
            response.setHeader("Cache-Control", "private, no-store");
            response.setHeader("X-Robots-Tag", "noindex, nofollow");
        } else {
            response.setHeader("Cache-Control", "public, max-age=60");
        }
        return "spring-home";
    }
}
