import { Global, Module } from '@nestjs/common';
import { CONFIG, loadConfig } from './config';

@Global()
@Module({
  providers: [{ provide: CONFIG, useFactory: () => loadConfig(process.env) }],
  exports: [CONFIG],
})
export class CoreModule {}
