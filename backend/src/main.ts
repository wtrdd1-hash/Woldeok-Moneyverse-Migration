import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { loadConfig } from './core/config';

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Express advertises itself in every response by default. Naming the stack
  // and its version tells an attacker which advisories to try first and buys
  // a legitimate client nothing.
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Loopback by default, not 0.0.0.0. This is an internal service; binding it
  // to every interface by default is how an "internal" service becomes
  // reachable from outside.
  await app.listen(config.port, process.env.HOST ?? '127.0.0.1');
}

void bootstrap();
