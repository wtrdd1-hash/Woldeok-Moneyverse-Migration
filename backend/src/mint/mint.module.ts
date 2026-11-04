import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MintController } from './mint.controller';
import { MintService } from './mint.service';
import { MintEvidenceReadService } from './mint-evidence-read.service';

@Module({
  imports: [AuthModule],
  controllers: [MintController],
  providers: [MintService, MintEvidenceReadService],
  exports: [MintService],
})
export class MintModule {}
