import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Woldeok Moneyverse API')
    .setDescription(
      'Moneyverse versioned API. Production keeps the NestJS service private; ' +
        'browser and native clients must reach it through an approved BFF/gateway. ' +
        'Never embed the server-to-server internal token in a client application.',
    )
    .setVersion('1.0')
    .addServer('/api/v1', 'Version 1')
    .addApiKey({ type: 'apiKey', name: 'x-internal-token', in: 'header' }, 'internal-token')
    .addApiKey({ type: 'apiKey', name: 'x-csrf-token', in: 'header' }, 'csrf-token')
    .build();
  return SwaggerModule.createDocument(app, config);
}

/**
 * The document describes every guard, parameter and error shape of an
 * internal service. Publishing it in production would hand an attacker a map
 * for free, so production mounts nothing at all rather than mounting behind
 * a check that could later be loosened.
 */
export function mountOpenApi(app: INestApplication, production: boolean): void {
  if (production) return;
  SwaggerModule.setup('docs', app, buildOpenApiDocument(app));
}
