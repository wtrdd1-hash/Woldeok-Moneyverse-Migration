import { Injectable } from '@nestjs/common';
import { mkdir, writeFile, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AntivirusScannerService, type ScanResult } from './antivirus-scanner.service';

export interface StoredChatImage {
  readonly storageKey: string;
  readonly mimeType: string;
  readonly width: number;
  readonly height: number;
  readonly size: number;
  readonly url: string;
}

const CHAT_KEY_REGEX = /^chat_[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

@Injectable()
export class ChatImageStorage {
  directory: string;

  constructor(
    private readonly scanner: AntivirusScannerService,
  ) {
    const defaultDir =
      process.env.CHAT_STORAGE_DIR ||
      (process.env.PHOTO_STORAGE_DIR
        ? path.join(path.dirname(process.env.PHOTO_STORAGE_DIR), 'chat')
        : path.resolve(process.cwd(), 'uploads/chat'));
    this.directory = defaultDir;
  }

  async save(buffer: Buffer, originalName = ''): Promise<StoredChatImage> {
    // 1. 다계층 안티바이러스 및 악성코드 정밀 스캔 (위협 감지 시 AntivirusThreatError throw)
    const scanResult: ScanResult = await this.scanner.scanImageBuffer(buffer, originalName);

    // 2. 디렉터리 안전 생성
    await mkdir(this.directory, { recursive: true, mode: 0o700 });

    // 3. 충돌 및 경로 탐색(Path Traversal)이 불가능한 안전 UUID 파일명 생성
    const storageKey = `chat_${randomUUID()}.${scanResult.extension}`;
    const filePath = path.join(this.directory, storageKey);

    await writeFile(filePath, buffer, { mode: 0o600, flag: 'wx' });

    return {
      storageKey,
      mimeType: scanResult.mimeType,
      width: scanResult.width,
      height: scanResult.height,
      size: buffer.length,
      url: `/api/v1/content/chat/media/${storageKey}`,
    };
  }

  async read(storageKey: unknown): Promise<{ readonly buffer: Buffer; readonly mimeType: string } | null> {
    if (typeof storageKey !== 'string' || !CHAT_KEY_REGEX.test(storageKey)) return null;
    try {
      const filePath = path.join(this.directory, storageKey);
      const buffer = await readFile(filePath);
      const ext = storageKey.slice(storageKey.lastIndexOf('.') + 1).toLowerCase();
      const mimeTypes: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
      };
      return { buffer, mimeType: mimeTypes[ext] || 'application/octet-stream' };
    } catch (error) {
      if (isErrnoException(error) && error.code === 'ENOENT') return null;
      throw error;
    }
  }

  async remove(storageKey: unknown): Promise<boolean> {
    if (typeof storageKey !== 'string' || !CHAT_KEY_REGEX.test(storageKey)) return false;
    try {
      await unlink(path.join(this.directory, storageKey));
      return true;
    } catch (error) {
      if (isErrnoException(error) && error.code === 'ENOENT') return false;
      throw error;
    }
  }
}
