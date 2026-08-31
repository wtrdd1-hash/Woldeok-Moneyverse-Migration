import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EarlyGameController } from './early-game.controller';
import { EARLY_GAME_REPOSITORY_PROVIDER } from './early-game.provider';

/**
 * The third module to register `EARLY_GAME_REPOSITORY_PROVIDER`, and
 * deliberately the same provider object as the other two rather than a fourth
 * copy of its factory: the rule that the repository is null with no
 * DATABASE_URL has one home, so it cannot drift between the modules that
 * answer for 16.1.
 */
@Module({
  imports: [AuthModule],
  controllers: [EarlyGameController],
  providers: [EARLY_GAME_REPOSITORY_PROVIDER],
})
export class EarlyGameModule {}
