import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Optional,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { AntivirusThreatError } from './antivirus-scanner.service';
import { ChatImageStorage } from './chat-image-storage';
import { DiscordAlertService } from '../discord/discord-alert.service';

@ApiTags('chat-upload')
@Controller('content/chat')
export class ChatUploadController {
  constructor(
    private readonly chatStorage: ChatImageStorage,
    @Optional() @Inject(DiscordAlertService) private readonly discordAlert?: DiscordAlertService,
  ) {}

  @Post('upload')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 8 * 1024 * 1024, // 8 MiB
        files: 1,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for customer support or direct chat with antivirus scanning' })
  async uploadChatImage(
    @Req() req: RequestWithSession,
    @UploadedFile() file?: { buffer: Buffer; originalname: string; size: number; mimetype: string },
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('업로드할 이미지 파일이 필요합니다.');
    }

    const actorUserId = req.session?.user_id || 'unknown';

    try {
      const stored = await this.chatStorage.save(file.buffer, file.originalname);
      return {
        success: true,
        url: stored.url,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        width: stored.width,
        height: stored.height,
        size: stored.size,
      };
    } catch (error) {
      if (error instanceof AntivirusThreatError) {
        // 관리자 디스코드 DM으로 긴급 보안 경보 전송
        if (this.discordAlert) {
          this.discordAlert
            .sendAdminDirectMessage({
              title: '🚨 [보안 경보] 악성 바이러스/웹쉘 업로드 즉시 차단됨',
              description: `채팅 이미지 업로드 단에서 악성 페이로드가 감지되어 서버 진입이 원천 차단되었습니다.`,
              color: 0xff0033,
              fields: [
                { name: '시도 유저 ID', value: `\`${actorUserId}\``, inline: true },
                { name: '파일명', value: `\`${file.originalname}\``, inline: true },
                { name: '위협 유형', value: `\`${error.threatType}\``, inline: false },
                { name: '상세 사유', value: error.threatDetail, inline: false },
                { name: '차단 일시', value: new Date().toISOString(), inline: false },
              ],
            })
            .catch(() => {});
        }

        throw new BadRequestException(
          `보안 검사 결과 악성 시그니처 또는 바이러스가 감지되어 파일이 안전하게 차단되었습니다: [${error.threatType}] ${error.threatDetail}`,
        );
      }

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get('media/:key')
  @ApiOperation({ summary: 'Serve uploaded chat image bytes' })
  async getChatMedia(@Param('key') key: string, @Res() res: Response): Promise<void> {
    const result = await this.chatStorage.read(key);
    if (!result) {
      throw new NotFoundException('요청한 이미지를 찾을 수 없습니다.');
    }

    res.setHeader('content-type', result.mimeType);
    res.setHeader('content-length', result.buffer.length);
    res.setHeader('cache-control', 'public, max-age=86400, immutable');
    res.setHeader('x-content-type-options', 'nosniff');
    res.end(result.buffer);
  }
}
