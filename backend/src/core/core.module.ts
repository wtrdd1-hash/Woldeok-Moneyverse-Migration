import { Global, Module } from '@nestjs/common';
import { CONFIG, loadConfig } from './config';
import { PG_POOL, poolProvider } from './pool.provider';
import { EncryptionService } from '../security/encryption.service';

@Global()
@Module({
  providers: [
    { provide: CONFIG, useFactory: () => loadConfig(process.env) },
    poolProvider,
    EncryptionService,
  ],
  exports: [CONFIG, PG_POOL, EncryptionService],
})
export class CoreModule {}
