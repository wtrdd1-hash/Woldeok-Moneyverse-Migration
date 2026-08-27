import { Global, Module } from '@nestjs/common';
import { CONFIG, loadConfig } from './config';
import { PG_POOL, poolProvider } from './pool.provider';

@Global()
@Module({
  providers: [{ provide: CONFIG, useFactory: () => loadConfig(process.env) }, poolProvider],
  exports: [CONFIG, PG_POOL],
})
export class CoreModule {}
