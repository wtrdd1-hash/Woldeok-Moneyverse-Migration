import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Woldeok Moneyverse API')
    .setDescription(
      'Internal API. Not reachable from the public internet: the Next.js ' +
        'application is the only public origin and calls this service over ' +
        'the internal network.',
    )
    .setVersion('1.0')
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
