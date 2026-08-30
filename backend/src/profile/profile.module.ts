import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { ProfileController } from './profile.controller';
import { ProfileImageController } from './profile-image.controller';
import { ProfileRepository } from './profile.repository';

@Module({
  // ContentModule for `PrivateImageStorage`: a profile picture and a gallery
  // photo share one directory, one validator and one key shape, and a second
  // store would be a second set of all three to keep in step.
  imports: [AuthModule, ContentModule],
  controllers: [ProfileController, ProfileImageController],
  providers: [
    {
      // A factory, not a class provider. `ProfileRepository`'s constructor
      // takes `Queryable`, which is an interface: TypeScript erases it to
      // `Object` in design:paramtypes, so Nest has no token to resolve and
      // AppModule throws at bootstrap -- taking the whole API down, not just
      // /profile.
      //
      // Null with no DATABASE_URL, because the application has to boot and
      // answer 503 on these routes rather than refuse to start.
      provide: ProfileRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new ProfileRepository(pool) : null),
    },
  ],
})
export class ProfileModule {}
