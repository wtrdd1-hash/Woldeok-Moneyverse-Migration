import { describe, expect, it, vi } from 'vitest';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

const id = 'a2a43160-a2a4-4316-82a4-43160a2a4316';
const notice = {announcementId:id,title:'Notice',body:'Published',imageUrl:null,imageAltText:null,isPinned:false,publishedAt:'2026-11-01T01:00:00.000Z'};

describe('public announcement source verification', () => {
  it.each([ContentController, AppContentController])('%s reports verified empty only after DB success', async Controller => {
    const publicAnnouncements = vi.fn().mockResolvedValue([]);
    const controller = new Controller({publicAnnouncements} as never);
    await expect(controller.announcements()).resolves.toEqual({announcements:[],count:0,sourceStatus:'VERIFIED'});
    expect(publicAnnouncements).toHaveBeenCalledOnce();
  });
  it.each([ContentController, AppContentController])('%s does not turn DB failures into empty success', async Controller => {
    const publicAnnouncements = vi.fn().mockRejectedValue(new Error('DB offline'));
    const controller = new Controller({publicAnnouncements} as never);
    await expect(controller.announcements()).rejects.toThrow('DB offline');
  });
  it.each([ContentController, AppContentController])('%s counts the real published rows', async Controller => {
    const controller = new Controller({publicAnnouncements:vi.fn().mockResolvedValue([notice])} as never);
    await expect(controller.announcements()).resolves.toEqual({announcements:[notice],count:1,sourceStatus:'VERIFIED'});
  });
});
