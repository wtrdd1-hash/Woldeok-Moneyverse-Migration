import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MintController } from './mint.controller';
import { MintService } from './mint.service';

@Module({
  imports: [AuthModule],
  controllers: [MintController],
  providers: [MintService],
  exports: [MintService],
})
export class MintModule {}
