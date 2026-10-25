import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TreasuryProposalsController } from './treasury-proposals.controller';

@Module({ imports: [AuthModule], controllers: [TreasuryProposalsController] })
export class TreasuryProposalsModule {}
