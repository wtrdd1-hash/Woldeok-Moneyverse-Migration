import test from 'node:test';
import assert from 'node:assert/strict';
import { MusicManager, MUSIC_COMMANDS } from './music.js';

test('registerCommands atomically replaces guild commands with the music command set', async () => {
  let receivedDefinitions = null;
  const guild = {
    commands: {
      set: async (definitions) => {
        receivedDefinitions = definitions;
        return new Map();
      },
    },
  };
  const manager = new MusicManager({
    guildId: 'guild-test',
    voiceChannelId: 'voice-test',
    logger: { log() {}, error() {}, warn() {} },
  });

  try {
    await manager.registerCommands(guild);
    assert.equal(receivedDefinitions, MUSIC_COMMANDS);
    assert.deepEqual(receivedDefinitions.map(({ name }) => name), [
      'play', 'skip', 'stop', 'pause', 'resume', 'queue', 'nowplaying', 'volume',
    ]);
  } finally {
    manager.dispose();
  }
});

test('volume clamp and status verification', () => {
  const manager = new MusicManager({
    guildId: 'guild-test',
    voiceChannelId: 'voice-test',
    logger: { log() {}, error() {}, warn() {} },
  });

  try {
    assert.equal(manager.volume, 100);
    manager.volume = Math.max(0, Math.min(200, 150));
    assert.equal(manager.volume, 150);
  } finally {
    manager.dispose();
  }
});

test('extractYouTubeVideoId handles multiple YouTube URL patterns', async () => {
  const { extractYouTubeVideoId } = await import('./music.js');
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/watch?v=09R8_2nJtjg'), '09R8_2nJtjg');
  assert.equal(extractYouTubeVideoId('https://youtu.be/09R8_2nJtjg?si=123'), '09R8_2nJtjg');
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/shorts/09R8_2nJtjg'), '09R8_2nJtjg');
  assert.equal(extractYouTubeVideoId('https://music.youtube.com/watch?v=09R8_2nJtjg'), '09R8_2nJtjg');
  assert.equal(extractYouTubeVideoId('not-a-url'), null);
});

test('fetchSponsorBlockSkipSegments handles empty and invalid video IDs safely', async () => {
  const { fetchSponsorBlockSkipSegments } = await import('./music.js');
  const emptyRes = await fetchSponsorBlockSkipSegments(null);
  assert.deepEqual(emptyRes, []);
  const invalidRes = await fetchSponsorBlockSkipSegments('invalid-video-id-999');
  assert.deepEqual(invalidRes, []);
});
