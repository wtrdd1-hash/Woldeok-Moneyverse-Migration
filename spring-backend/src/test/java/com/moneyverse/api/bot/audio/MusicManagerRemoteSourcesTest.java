package com.moneyverse.api.bot.audio;

import com.sedmelluq.discord.lavaplayer.source.twitch.TwitchStreamAudioSourceManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Registering Lavaplayer's remote sources contacts twitch.tv while the bean is constructed.
 * Runtimes without a Discord bot token (Test, sandboxes, legacy previews) never play audio, so
 * they made an outbound connection and kept its threads for nothing. Observed 2026-11-26 in
 * the isolated capacity sandbox, whose only other connection was its own database.
 */
class MusicManagerRemoteSourcesTest {
    @Test void withoutABotTokenNoRemoteSourceIsRegistered() {
        var manager = new MusicManager("");
        assertNull(manager.playerManager().source(TwitchStreamAudioSourceManager.class));
    }

    @Test void withABotTokenRemoteSourcesStayRegistered() {
        var manager = new MusicManager("configured");
        assertNotNull(manager.playerManager().source(TwitchStreamAudioSourceManager.class));
    }
}
