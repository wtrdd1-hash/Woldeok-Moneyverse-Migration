import { describe, expect, it, vi } from 'vitest';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

for (const ControllerClass of [ContentController, AppContentController]) {
  describe(`${ControllerClass.name} gallery day`, () => {
    it('forwards only one validated day to the service', async () => {
      const publicPhotos = vi.fn().mockResolvedValue([]);
      const controller = new ControllerClass({ publicPhotos } as never);
      await expect(controller.photos({ day: '2026-09-07' })).resolves.toEqual({ photos: [] });
      expect(publicPhotos).toHaveBeenCalledWith({ day: '2026-09-07' });
    });
    it('rejects duplicate and unsupported parameters before querying', async () => {
      const publicPhotos = vi.fn().mockResolvedValue([]);
      const controller = new ControllerClass({ publicPhotos } as never);
      await expect(controller.photos({ day: ['2026-09-07', '2026-09-08'] })).rejects.toMatchObject({ status: 400 });
      await expect(controller.photos({ day: '2026-09-07', debug: '1' })).rejects.toMatchObject({ status: 400 });
      expect(publicPhotos).not.toHaveBeenCalled();
    });
  });
}
