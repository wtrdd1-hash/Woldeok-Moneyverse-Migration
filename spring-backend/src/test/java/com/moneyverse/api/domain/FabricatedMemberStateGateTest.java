package com.moneyverse.api.domain;

import com.moneyverse.api.domain.club.controller.WarfareController;
import com.moneyverse.api.domain.collection.controller.CollectionController;
import com.moneyverse.api.domain.content.controller.ContentController;
import com.moneyverse.api.domain.discord.controller.DiscordController;
import com.moneyverse.api.domain.economy.controller.BurnEventController;
import com.moneyverse.api.domain.economy.controller.HotTimeController;
import com.moneyverse.api.domain.editorial.controller.BlogVerifiedController;
import com.moneyverse.api.domain.help.controller.HelpController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.space.controller.SpaceController;
import com.moneyverse.api.domain.space.service.SpaceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Security review 2026-11-28: member and public screens were fed invented live state — a burn
 * event with WLD totals, participants and a jackpot; a warfare season with club standings and
 * territory taxes; an active 1.5x work-reward hot time and a weekly buff schedule; real-estate
 * district prices and occupancy; a "connected" Discord guild with ids and latency; a member's own
 * collection pieces (and a collection edit that saved nothing); a popup for a season that does not
 * exist; invented terms text for any page slug; and "verified" help/blog articles that no reviewer
 * approved. Members act on these (a boost they chase, a jackpot they burn WLD for). Each answers
 * 503 (after any existing session check) until it reads its canonical source. Taxonomy constants
 * (category names) are product copy and stay.
 */
class FabricatedMemberStateGateTest {
    private final UserAuthService auth = mock(UserAuthService.class);
    private final MockHttpServletRequest request = new MockHttpServletRequest();

    private void member() {
        UserAuthService.SessionInfo s = new UserAuthService.SessionInfo();
        s.setUserId(UUID.randomUUID());
        s.setRoles(List.of());
        when(auth.resolveSession(any())).thenReturn(Optional.of(s));
    }

    private static void unavailable(Executable call) {
        ResponseStatusException e = assertThrows(ResponseStatusException.class, call,
                "invented live state must not be served");
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void burnEventFiguresAreNotInvented() {
        BurnEventController c = new BurnEventController(auth);
        unavailable(c::getCurrentBurnEvent);
        unavailable(c::getCumulativeStats);
    }

    @Test void warfareStandingsAreNotInvented() {
        WarfareController c = new WarfareController(auth);
        unavailable(c::getCurrentSeason);
        unavailable(c::listTerritories);
    }

    @Test void hotTimeBoostsAreNotInvented() {
        HotTimeController c = new HotTimeController(auth);
        unavailable(c::getActiveHotTime);
        unavailable(c::getWeeklySchedule);
    }

    @Test void realEstateDistrictsAreNotInvented() {
        unavailable(() -> new SpaceController(mock(SpaceService.class)).listDistricts());
    }

    @Test void discordGuildStatusIsNotInvented() {
        unavailable(() -> new DiscordController().getGuildStatus());
    }

    @Test void memberCollectionIsNotInvented() {
        member();
        CollectionController c = new CollectionController(auth);
        unavailable(() -> c.listCollections(request));
        unavailable(() -> c.updatePiece(request, "piece-01", Map.of("isFavorite", true)));
    }

    @Test void collectionStillRequiresASession() {
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
                () -> new CollectionController(auth).listCollections(request));
        assertEquals(401, e.getStatusCode().value());
    }

    @Test void contentPopupsAndPagesAreNotInvented() {
        ContentController c = new ContentController();
        unavailable(c::getActivePopups);
        unavailable(() -> c.getStaticPage("terms"));
    }

    @Test void helpAndBlogArticlesAreNotInvented() {
        HelpController help = new HelpController();
        unavailable(() -> help.categories("ko"));
        unavailable(() -> help.search(Map.of("query", "2fa")));
        unavailable(() -> help.article("ko", "anything"));
        BlogVerifiedController blog = new BlogVerifiedController();
        unavailable(() -> blog.listArticles(null, 10));
        unavailable(() -> blog.getArticle("anything"));
    }
}
