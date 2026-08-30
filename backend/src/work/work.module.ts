import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module'; import { WorkController } from './work.controller'; import { WorkRepository } from './work.repository';
@Module({ imports:[AuthModule], controllers:[WorkController], providers:[WorkRepository] }) export class WorkModule {}
