import { Module } from '@nestjs/common';
import { BlogVerifiedRepository } from './blog-verified.repository';
import { BlogVerifiedPublicController } from './blog-verified.controller';
import { BlogVerifiedAdminController } from './blog-verified-admin.controller';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  providers: [BlogVerifiedRepository],
  controllers: [BlogVerifiedPublicController,BlogVerifiedAdminController],
  exports: [BlogVerifiedRepository],
})
export class BlogVerifiedModule {}
