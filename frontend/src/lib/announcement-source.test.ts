import { describe, expect, it } from 'vitest';
import { parseVerifiedAnnouncements } from './announcement-source';

const row = {announcementId:'a2a43160-a2a4-4316-82a4-43160a2a4316',title:'Published notice',body:'Public content',imageUrl:null,imageAltText:null,isPinned:false,publishedAt:'2026-11-01T01:00:00.000Z'};
const verified = (rows:unknown[]) => ({sourceStatus:'VERIFIED',count:rows.length,announcements:rows});

describe('published announcement source proof', () => {
  it('accepts a real verified empty snapshot', () => expect(parseVerifiedAnnouncements(verified([]))).toEqual(verified([])));
  it('accepts one published announcement', () => expect(parseVerifiedAnnouncements(verified([row]))).toEqual(verified([row])));
  it.each([
    null, {}, {announcements:[]}, {sourceStatus:'UNAVAILABLE',count:0,announcements:[]},
    {sourceStatus:'VERIFIED',count:1,announcements:[]}, verified([{...row,title:''}]),
    verified([{...row,imageUrl:'javascript:alert(1)'}]),
    verified([{...row,publishedAt:'not-a-date'}]), verified([row,row]),
    verified(Array.from({length:21},()=>row)),
  ])('rejects missing, forged or unsafe evidence %#', value => expect(parseVerifiedAnnouncements(value)).toBeNull());
});
