package com.moneyverse.api.bot.audio;

import com.sedmelluq.discord.lavaplayer.format.StandardAudioDataFormats;
import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import com.sedmelluq.discord.lavaplayer.track.playback.MutableAudioFrame;
import discord4j.voice.AudioProvider;

import java.nio.ByteBuffer;

/**
 * Lavaplayer AudioPlayer의 오디오 프레임을 Discord4J Voice 음성 스트림으로 브리지하는 AudioProvider
 */
public class LavaPlayerAudioProvider extends AudioProvider {

    private final AudioPlayer player;
    private final MutableAudioFrame frame = new MutableAudioFrame();

    public LavaPlayerAudioProvider(AudioPlayer player) {
        // Discord Opus 표준 형식의 최대 청크 크기 버퍼 할당
        super(ByteBuffer.allocate(StandardAudioDataFormats.DISCORD_OPUS.maximumChunkSize()));
        frame.setBuffer(getBuffer());
        this.player = player;
    }

    @Override
    public boolean provide() {
        // Lavaplayer에서 오디오 프레임 추출
        boolean didProvide = player.provide(frame);
        if (didProvide) {
            getBuffer().flip();
        }
        return didProvide;
    }
}
