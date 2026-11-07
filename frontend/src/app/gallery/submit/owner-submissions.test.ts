import { describe, expect, it } from 'vitest';
import { parseOwnerPhotoSubmissions } from './owner-submissions';

const ID = '11111111-1111-4111-8111-111111111111';
const row = {
  photo_id: ID,
  image_url: '/media/11111111-1111-4111-8111-111111111111.jpg',
  alt_text: 'Sunset over the village',
  published: false,
  submitted_at: '2026-11-01T12:00:00.000Z',
  published_at: null,
};

describe('member-only photo submission source proof', () => {
  it('accepts a verified empty owner result and a pending owner row', () => {
    expect(parseOwnerPhotoSubmissions({ submissions: [] })).toEqual([]);
    expect(parseOwnerPhotoSubmissions({ submissions: [row] })).toEqual([row]);
  });
  it('rejects an invalid response instead of reporting an empty collection', () => {
    for (const payload of [null, {}, { submissions: null }, { submissions: {} }, { submissions: 'none' }]) {
      expect(parseOwnerPhotoSubmissions(payload)).toBeNull();
    }
  });
  it('rejects forged withdrawal candidates, duplicates and unbounded rows', () => {
    for (const bad of [
      { ...row, photo_id: '../../private' },
      { ...row, image_url: 'javascript:alert(1)' },
      { ...row, image_url: '//attacker.example/x.jpg' },
      { ...row, alt_text: '' },
      { ...row, published: 'false' },
      { ...row, submitted_at: 'not-a-date' },
      { ...row, published_at: 'not-a-date' },
    ]) {
      expect(parseOwnerPhotoSubmissions({ submissions: [bad] })).toBeNull();
    }
    expect(parseOwnerPhotoSubmissions({ submissions: [row, row] })).toBeNull();
    expect(parseOwnerPhotoSubmissions({ submissions: Array(31).fill(row) })).toBeNull();
  });
  it('requires a coherent published state and permits approved external HTTPS media', () => {
    expect(parseOwnerPhotoSubmissions({ submissions: [{ ...row, published: true }] })).toBeNull();
    expect(parseOwnerPhotoSubmissions({ submissions: [{
      ...row, published: true, published_at: '2026-11-01T12:10:00.000Z',
      image_url: 'https://images.example.org/photo.jpg',
    }] })).toHaveLength(1);
  });
});
