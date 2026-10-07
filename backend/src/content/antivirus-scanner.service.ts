import { Injectable, Logger } from '@nestjs/common';
import * as net from 'node:net';

export class AntivirusThreatError extends Error {
  constructor(
    public readonly threatType: string,
    public readonly threatDetail: string,
  ) {
    super(`악성 시그니처 또는 바이러스가 감지되었습니다: [${threatType}] ${threatDetail}`);
    this.name = 'AntivirusThreatError';
  }
}

export interface ScanResult {
  readonly isClean: boolean;
  readonly mimeType: string;
  readonly extension: string;
  readonly width: number;
  readonly height: number;
  readonly threatType?: string;
  readonly threatDetail?: string;
  readonly scannedWith: 'clamav' | 'builtin-signatures';
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MiB
const MAX_SIDE = 8_000;
const MAX_PIXELS = 40_000_000;

// 표준 안티바이러스 테스트 시그니처 (EICAR)
const EICAR_SIGNATURE = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

// 위험 실행 파일 및 아카이브 매직넘버 시그니처
const DANGEROUS_MAGIC_NUMBERS: readonly { readonly name: string; readonly pattern: Buffer }[] = [
  { name: 'DOS/PE Executable (MZ)', pattern: Buffer.from([0x4d, 0x5a]) },
  { name: 'Linux ELF Executable', pattern: Buffer.from([0x7f, 0x45, 0x4c, 0x46]) },
  { name: 'Mach-O Binary (32-bit)', pattern: Buffer.from([0xfe, 0xed, 0xfa, 0xce]) },
  { name: 'Mach-O Binary (64-bit)', pattern: Buffer.from([0xfe, 0xed, 0xfa, 0xcf]) },
  { name: 'Mach-O Binary (Reverse 32)', pattern: Buffer.from([0xce, 0xfa, 0xed, 0xfe]) },
  { name: 'Mach-O Binary (Reverse 64)', pattern: Buffer.from([0xcf, 0xfa, 0xed, 0xfe]) },
  { name: 'Unix Script Shebang', pattern: Buffer.from([0x23, 0x21]) }, // #!
  { name: 'ZIP Archive / Backdoor Package', pattern: Buffer.from([0x50, 0x4b, 0x03, 0x04]) },
  { name: 'RAR Archive', pattern: Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]) },
  { name: '7-Zip Archive', pattern: Buffer.from([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c]) },
  { name: 'MS Office OLE Compound / Macro', pattern: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) },
];

// 악성 웹쉘 및 스크립트 정규식 패턴
const MALICIOUS_SCRIPT_PATTERNS: readonly { readonly name: string; readonly regex: RegExp }[] = [
  { name: 'PHP Script Tag', regex: /<\?php/i },
  { name: 'HTML/JS Script Injection', regex: /<script[\s>]/i },
  { name: 'Dangerous Eval Execution', regex: /eval\s*\(/i },
  { name: 'Base64 Obfuscated Execution', regex: /base64_decode\s*\(/i },
  { name: 'PHP Compressed Payload', regex: /(gzinflate|gzuncompress|str_rot13)\s*\(/i },
  { name: 'System Command Execution', regex: /(system|passthru|shell_exec|popen|proc_open)\s*\(/i },
  { name: 'Windows Shell Spawning', regex: /(powershell(\.exe)?|cmd(\.exe)?)/i },
  { name: 'JavaScript URI Pseudo-protocol', regex: /(javascript|vbscript)\s*:/i },
  { name: 'DOM XSS Event Handler', regex: /<[a-z]+[^>]+(onload|onerror|onclick|onmouseover)\s*=/i },
  { name: 'Embedded IFrame / SVG Payload', regex: /<(iframe|object|embed|svg)[\s>]/i },
];

@Injectable()
export class AntivirusScannerService {
  private readonly logger = new Logger(AntivirusScannerService.name);

  /**
   * 버퍼 전체를 검사하여 이미지 유효성, 매직넘버, 바이러스/악성 스크립트를 정밀 스캔합니다.
   */
  async scanImageBuffer(buffer: Buffer, originalName = ''): Promise<ScanResult> {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
      throw new AntivirusThreatError('INVALID_FILE', '파일이 너무 작거나 비어 있습니다.');
    }
    if (buffer.length > MAX_BYTES) {
      throw new AntivirusThreatError('SIZE_EXCEEDED', `파일 크기가 최대 제한(8MB)을 초과했습니다.`);
    }

    // 이중 확장자 및 위험 확장자 검사
    const lowerName = originalName.toLowerCase();
    if (
      /\.(php|phtml|phar|exe|sh|bat|cmd|vbs|jar|py|pl|cgi|asp|aspx|jsp|scr|msi|dll)(\.|\b)/i.test(
        lowerName,
      )
    ) {
      throw new AntivirusThreatError(
        'DANGEROUS_EXTENSION',
        `위험한 확장자가 감지되었습니다: ${originalName}`,
      );
    }

    // 1단계: EICAR 표준 안티바이러스 테스트 시그니처 검사
    const bufferString = buffer.toString('binary');
    if (bufferString.includes(EICAR_SIGNATURE)) {
      throw new AntivirusThreatError('EICAR_TEST_VIRUS', 'EICAR 표준 안티바이러스 테스트 시그니처가 감지되었습니다.');
    }

    // 2단계: 이미지 포맷 및 정규 매직넘버 검증
    const format = this.detectImageFormat(buffer);
    if (!format) {
      // 혹시 위험 실행 파일 매직넘버와 일치하는지 확인
      for (const dm of DANGEROUS_MAGIC_NUMBERS) {
        if (buffer.subarray(0, dm.pattern.length).equals(dm.pattern)) {
          throw new AntivirusThreatError(
            'EXECUTABLE_BINARY_DETECTED',
            `실행 파일 바이너리 헤더 [${dm.name}]가 감지되었습니다.`,
          );
        }
      }
      throw new AntivirusThreatError(
        'UNSUPPORTED_OR_CORRUPTED_FORMAT',
        '지원되지 않거나 손상된 이미지 파일입니다 (PNG, JPEG, WebP, GIF만 허용).',
      );
    }

    // 3단계: 바이너리 내부 실행 파일 헤더 삽입(Polyglot) 검사
    // 이미지 헤더 이후에 실행 파일 바이너리(MZ, ELF 등)가 숨겨져 있는지 탐색
    for (const dm of DANGEROUS_MAGIC_NUMBERS) {
      if (dm.name.startsWith('DOS/PE') || dm.name.startsWith('Linux ELF')) {
        const index = buffer.indexOf(dm.pattern);
        if (index > 0 && index < 2048) {
          throw new AntivirusThreatError(
            'POLYGLOT_MALWARE_EMBEDDED',
            `이미지 내에 숨겨진 악성 바이너리 헤더 [${dm.name}]가 감지되었습니다.`,
          );
        }
      }
    }

    // 4단계: 악성 스크립트 및 웹쉘 텍스트 패턴 스캔
    // 바이너리 데이터 중 UTF-8/ASCII 문자열로 해석되는 구간에서 웹쉘/스크립트 주입 검출
    const asciiText = buffer.toString('latin1');
    for (const pattern of MALICIOUS_SCRIPT_PATTERNS) {
      if (pattern.regex.test(asciiText)) {
        throw new AntivirusThreatError(
          'MALICIOUS_SCRIPT_WEBSHELL',
          `웹쉘 또는 악성 스크립트 패턴 [${pattern.name}]이 감지되었습니다.`,
        );
      }
    }

    // 5단계: 이미지 디멘션 및 Decompression Bomb 방어 검증
    const dimensions = this.getImageDimensions(buffer, format.mimeType);
    if (!dimensions || dimensions.width < 1 || dimensions.height < 1) {
      throw new AntivirusThreatError('CORRUPTED_DIMENSIONS', '이미지 해상도 메타데이터를 파싱할 수 없습니다.');
    }
    if (dimensions.width > MAX_SIDE || dimensions.height > MAX_SIDE) {
      throw new AntivirusThreatError(
        'IMAGE_DIMENSION_LIMIT',
        `이미지 가로/세로 크기는 최대 ${MAX_SIDE}px를 넘을 수 없습니다 (현재: ${dimensions.width}x${dimensions.height}).`,
      );
    }
    if (dimensions.width * dimensions.height > MAX_PIXELS) {
      throw new AntivirusThreatError(
        'PIXEL_FLOOD_ATTACK',
        `디컴프레션 픽셀 폭탄 방지: 최대 ${MAX_PIXELS / 1_000_000}메가픽셀을 초과할 수 없습니다.`,
      );
    }

    // 6단계: ClamAV 데몬 소켓/TCP 연결 가능 시 외부 딥 스캔 수행
    const clamAvResult = await this.tryClamAvScan(buffer);
    if (clamAvResult) {
      if (!clamAvResult.isClean) {
        throw new AntivirusThreatError('CLAMAV_DETECTED', clamAvResult.virusName || '알려진 악성코드 감염');
      }
      return {
        isClean: true,
        mimeType: format.mimeType,
        extension: format.extension,
        width: dimensions.width,
        height: dimensions.height,
        scannedWith: 'clamav',
      };
    }

    return {
      isClean: true,
      mimeType: format.mimeType,
      extension: format.extension,
      width: dimensions.width,
      height: dimensions.height,
      scannedWith: 'builtin-signatures',
    };
  }

  private detectImageFormat(
    buffer: Buffer,
  ): { readonly mimeType: string; readonly extension: string } | null {
    // PNG
    if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      return { mimeType: 'image/png', extension: 'png' };
    }
    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { mimeType: 'image/jpeg', extension: 'jpg' };
    }
    // WebP
    if (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return { mimeType: 'image/webp', extension: 'webp' };
    }
    // GIF (GIF87a or GIF89a)
    if (
      buffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF89a'
    ) {
      return { mimeType: 'image/gif', extension: 'gif' };
    }
    return null;
  }

  private getImageDimensions(
    buffer: Buffer,
    mimeType: string,
  ): { readonly width: number; readonly height: number } | null {
    if (mimeType === 'image/png') {
      if (buffer.length < 24 || buffer.subarray(12, 16).toString('ascii') !== 'IHDR') return null;
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (mimeType === 'image/jpeg') {
      let at = 2;
      while (at + 9 < buffer.length) {
        if (buffer[at] !== 0xff) return null;
        const marker = buffer[at + 1] ?? 0;
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
          at += 2;
          continue;
        }
        const length = buffer.readUInt16BE(at + 2);
        if (length < 2 || at + 2 + length > buffer.length) return null;
        const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
        if (isFrame) return { height: buffer.readUInt16BE(at + 5), width: buffer.readUInt16BE(at + 7) };
        if (marker === 0xda) return null;
        at += 2 + length;
      }
      return null;
    }
    if (mimeType === 'image/webp') {
      const chunk = buffer.subarray(12, 16).toString('ascii');
      if (chunk === 'VP8 ' && buffer.length >= 30) {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff,
        };
      }
      if (chunk === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
        const bits = buffer.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === 'VP8X' && buffer.length >= 30) {
        const at24 = (offset: number): number =>
          (buffer[offset] ?? 0) | ((buffer[offset + 1] ?? 0) << 8) | ((buffer[offset + 2] ?? 0) << 16);
        return { width: at24(24) + 1, height: at24(27) + 1 };
      }
      return null;
    }
    if (mimeType === 'image/gif') {
      if (buffer.length < 10) return null;
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
    }
    return null;
  }

  private async tryClamAvScan(
    buffer: Buffer,
  ): Promise<{ readonly isClean: boolean; readonly virusName?: string } | null> {
    const clamHost = process.env.CLAMAV_HOST;
    const clamPort = Number.parseInt(process.env.CLAMAV_PORT || '3310', 10);
    if (!clamHost) return null;

    return new Promise((resolve) => {
      const socket = net.createConnection({ host: clamHost, port: clamPort }, () => {
        socket.write('zINSTREAM\0');
        const chunkSize = 2048;
        for (let i = 0; i < buffer.length; i += chunkSize) {
          const chunk = buffer.subarray(i, i + chunkSize);
          const header = Buffer.alloc(4);
          header.writeUInt32BE(chunk.length, 0);
          socket.write(header);
          socket.write(chunk);
        }
        const zero = Buffer.alloc(4);
        zero.writeUInt32BE(0, 0);
        socket.write(zero);
      });

      socket.setTimeout(2500);
      let response = '';

      socket.on('data', (data) => {
        response += data.toString('utf-8');
      });

      socket.on('end', () => {
        if (response.includes('OK')) {
          resolve({ isClean: true });
        } else if (response.includes('FOUND')) {
          const match = response.match(/stream:\s+(.+)\s+FOUND/);
          const virusName = (match && match[1]) ? match[1] : 'Unknown ClamAV Threat';
          resolve({ isClean: false, virusName });
        } else {
          resolve(null);
        }
      });

      socket.on('error', (err) => {
        this.logger.debug(`ClamAV socket connect failed, fallback to builtin: ${err.message}`);
        resolve(null);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
    });
  }
}
