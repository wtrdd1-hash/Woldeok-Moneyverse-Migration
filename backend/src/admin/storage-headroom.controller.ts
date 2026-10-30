import { Controller, Get, Header, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { readVerifiedStorageSnapshot } from './storage-evidence-reader';

@ApiTags('admin')
@Controller('admin/operations')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class StorageHeadroomController {
  readSnapshot = readVerifiedStorageSnapshot;

  @Get('storage')
  @Header('Cache-Control', 'private, no-store, max-age=0')
  @Header('Pragma', 'no-cache')
  @Header('X-Robots-Tag', 'noindex, nofollow')
  @ApiOperation({ summary: 'Read verified, signed host disk headroom; unavailable without fresh host evidence' })
  getStorage() {
    try {
      return this.readSnapshot();
    } catch {
      // Never reveal the evidence file, signing key, mount path, or host details.
      throw new ServiceUnavailableException('storage evidence unavailable');
    }
  }
}
