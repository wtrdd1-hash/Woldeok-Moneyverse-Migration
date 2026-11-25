import { describe, expect, it } from 'vitest';
import { sceneForPath } from './route-scene';

describe('sceneForPath', () => {
  it.each([
    ['/', 'skyline'],
    ['/admin/logs/errors', 'citadel'],
    ['/wallet', 'vault'],
    ['/central-bank', 'vault'],
    ['/stocks/CHIMU', 'chart'],
    ['/en/blog/some-post', 'board'],
    ['/shop', 'stall'],
    ['/support', 'tavern'],
    ['/tools/compound-calculator', 'lab'],
    ['/terms', 'gate'],
    ['/unknown-route', 'gate'],
  ])('%s -> %s', (path, scene) => {
    expect(sceneForPath(path)).toBe(scene);
  });

  it('does not match a prefix inside another segment', () => {
    expect(sceneForPath('/shopping')).toBe('gate');
  });
});
