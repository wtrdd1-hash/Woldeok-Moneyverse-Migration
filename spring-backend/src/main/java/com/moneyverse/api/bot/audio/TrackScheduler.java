package com.moneyverse.api.bot.audio;

import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import com.sedmelluq.discord.lavaplayer.player.event.AudioEventAdapter;
import com.sedmelluq.discord.lavaplayer.tools.FriendlyException;
import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import com.sedmelluq.discord.lavaplayer.track.AudioTrackEndReason;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

/**
 * Lavaplayer 재생 대기열 및 수명주기 이벤트 스케줄러
 */
public class TrackScheduler extends AudioEventAdapter {

    private static final Logger log = LoggerFactory.getLogger(TrackScheduler.class);
    private static final int MAX_QUEUE_SIZE = 50;

    private final AudioPlayer player;
    private final BlockingQueue<AudioTrack> queue;

    public TrackScheduler(AudioPlayer player) {
        this.player = player;
        this.queue = new LinkedBlockingQueue<>(MAX_QUEUE_SIZE);
    }

    /**
     * 트랙을 대기열에 추가하거나, 현재 아무것도 재생 중이지 않으면 즉시 재생
     */
    public boolean queue(AudioTrack track) {
        if (queue.size() >= MAX_QUEUE_SIZE) {
            return false;
        }

        if (!player.startTrack(track, true)) {
            return queue.offer(track);
        }
        return true;
    }

    /**
     * 다음 트랙 재생
     */
    public AudioTrack nextTrack() {
        AudioTrack next = queue.poll();
        if (next != null) {
            player.startTrack(next, false);
        } else {
            player.stopTrack();
        }
        return next;
    }

    /**
     * 재생 중지 및 대기열 비우기
     */
    public void stop() {
        queue.clear();
        player.stopTrack();
    }

    /**
     * 일시 정지
     */
    public void pause() {
        player.setPaused(true);
    }

    /**
     * 재생 재개
     */
    public void resume() {
        player.setPaused(false);
    }

    /**
     * 음량 조절 (0~100)
     */
    public void setVolume(int volume) {
        int bounded = Math.max(0, Math.min(100, volume));
        player.setVolume(bounded);
    }

    /**
     * 현재 재생 중인 트랙
     */
    public AudioTrack getPlayingTrack() {
        return player.getPlayingTrack();
    }

    /**
     * 현재 대기열 목록 복사본
     */
    public List<AudioTrack> getQueue() {
        return new ArrayList<>(queue);
    }

    public boolean isPaused() {
        return player.isPaused();
    }

    public int getVolume() {
        return player.getVolume();
    }

    @Override
    public void onTrackEnd(AudioPlayer player, AudioTrack track, AudioTrackEndReason endReason) {
        if (endReason.mayStartNext) {
            log.info("[AudioScheduler] Track ended ({}): {}. Advancing to next track.", endReason, track.getInfo().title);
            nextTrack();
        }
    }

    @Override
    public void onTrackException(AudioPlayer player, AudioTrack track, FriendlyException exception) {
        log.error("[AudioScheduler] Track error on {}: {}", track.getInfo().title, exception.getMessage());
        nextTrack();
    }

    @Override
    public void onTrackStuck(AudioPlayer player, AudioTrack track, long thresholdMs) {
        log.warn("[AudioScheduler] Track stuck on {} for {}ms. Forcing skip.", track.getInfo().title, thresholdMs);
        nextTrack();
    }
}
