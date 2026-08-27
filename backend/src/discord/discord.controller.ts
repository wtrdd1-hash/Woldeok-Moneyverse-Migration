import {
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { createDiscordInteractionHandler } from './interactions';

export const DISCORD_INTERACTION_HANDLER = Symbol('DISCORD_INTERACTION_HANDLER');

type InteractionHandler = ReturnType<typeof createDiscordInteractionHandler>;

/**
 * Discord's interaction webhook.
 *
 * The endpoint is public by Discord's design — anyone can POST to it — and
 * the only thing separating a real interaction from a forgery is an Ed25519
 * signature over the exact request bytes. The handler therefore verifies
 * before parsing, and this controller must hand it the raw body: any JSON
 * round trip re-serialises key order and whitespace, and the signature no
 * longer matches.
 *
 * `main.ts` registers a raw body parser for this path alone. The handler is
 * null unless the configuration is complete, and it stays null in production
 * because the bundled rate limiter is single-process only.
 */
@ApiTags('discord')
@Controller('integrations/discord')
export class DiscordController {
  constructor(
    @Inject(DISCORD_INTERACTION_HANDLER) private readonly handler: InteractionHandler | null,
  ) {}

  @Post('interactions')
  @HttpCode(200)
  @ApiOperation({ summary: 'Discord interaction webhook' })
  async interactions(@Req() request: Request) {
    if (!this.handler) throw new ServiceUnavailableException('discord interactions are disabled');
    // Headers are passed whole: the handler reads the signature and timestamp
    // itself and rebuilds the signed payload as timestamp || body, so
    // extracting them here would only create a second place for that
    // reconstruction to drift.
    const result = await this.handler.handle({
      headers: request.headers,
      rawBody: Buffer.isBuffer(request.body) ? request.body : Buffer.from(''),
    });
    return result;
  }
}
