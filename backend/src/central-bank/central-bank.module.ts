import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MintModule } from '../mint/mint.module';
import { CentralBankController } from './central-bank.controller';
import { CentralBankService } from './central-bank.service';

@Module({
  imports: [AuthModule, MintModule],
  controllers: [CentralBankController],
  providers: [CentralBankService],
  exports: [CentralBankService],
})
export class CentralBankModule {}
