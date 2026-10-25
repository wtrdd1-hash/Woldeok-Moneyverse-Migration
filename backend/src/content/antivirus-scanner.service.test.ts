import { describe, expect, it } from 'vitest';
import * as net from 'node:net';
import { AntivirusScannerService, AntivirusThreatError } from './antivirus-scanner.service';

function createValidPng(width = 100, height = 100): Buffer {
  const buffer = Buffer.alloc(64);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write('IHDR', 12, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

async function withClamReply(reply: string | null, run: () => Promise<void>): Promise<void> {
  const server = net.createServer((socket) => {
    socket.once('data', () => {
      if (reply !== null) socket.end(`${reply}\0`);
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('expected TCP listener');
  const previous = {
    host: process.env.CLAMAV_HOST,
    port: process.env.CLAMAV_PORT,
    socket: process.env.CLAMAV_SOCKET,
  };
  process.env.CLAMAV_HOST = '127.0.0.1';
  process.env.CLAMAV_PORT = String(address.port);
  process.env.CLAMAV_SOCKET = '/nonexistent-moneyverse-test-clamd.sock';
  try {
    await run();
  } finally {
    for (const [name, value] of Object.entries({
      CLAMAV_HOST: previous.host,
      CLAMAV_PORT: previous.port,
      CLAMAV_SOCKET: previous.socket,
    })) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('AntivirusScannerService', () => {
  const scanner = new AntivirusScannerService();

  it('정상 PNG 이미지를 올바르게 통과시키고 메타데이터를 반환한다', async () => {
    const png = createValidPng(200, 150);
    const result = await scanner.scanImageBuffer(png, 'screenshot.png');

    expect(result.isClean).toBe(true);
    expect(result.mimeType).toBe('image/png');
    expect(result.extension).toBe('png');
    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
  });

  it('EICAR 표준 안티바이러스 테스트 시그니처 감지 시 AntivirusThreatError를 발생시킨다', async () => {
    const eicar = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
    await expect(scanner.scanImageBuffer(eicar, 'test.png')).rejects.toThrow(AntivirusThreatError);
    await expect(scanner.scanImageBuffer(eicar, 'test.png')).rejects.toThrow(/EICAR/);
  });

  it('DOS/PE 실행 바이너리(MZ 헤더) 감지 시 차단한다', async () => {
    const pe = Buffer.concat([Buffer.from([0x4d, 0x5a]), Buffer.alloc(100)]);
    await expect(scanner.scanImageBuffer(pe, 'malware.exe')).rejects.toThrow(AntivirusThreatError);
  });

  it('이미지 내부 악성 웹쉘 또는 script 주입 시 차단한다', async () => {
    const pngWithScript = Buffer.concat([
      createValidPng(50, 50),
      Buffer.from('<script>alert("xss")</script>', 'utf-8'),
    ]);
    await expect(scanner.scanImageBuffer(pngWithScript, 'image.png')).rejects.toThrow(AntivirusThreatError);
  });

  it('PHP 웹쉘 코드(<?php) 주입 시 차단한다', async () => {
    const pngWithPhp = Buffer.concat([
      createValidPng(50, 50),
      Buffer.from('<?php system($_GET["c"]); ?>', 'utf-8'),
    ]);
    await expect(scanner.scanImageBuffer(pngWithPhp, 'image.png')).rejects.toThrow(AntivirusThreatError);
  });

  it('위험한 이중 확장자(test.php.png, exploit.exe) 파일명 거부', async () => {
    const png = createValidPng(50, 50);
    await expect(scanner.scanImageBuffer(png, 'shell.php.png')).rejects.toThrow(AntivirusThreatError);
  });

  it('configured ClamAV accepts only an exact clean response', async () => {
    await withClamReply('stream: OK', async () => {
      const result = await scanner.scanImageBuffer(createValidPng(), 'photo.png');
      expect(result.scannedWith).toBe('clamav');
    });
  });

  it('configured ClamAV rejects a FOUND response containing an OK substring', async () => {
    await withClamReply('stream: Test-Signature FOUND; OK', async () => {
      await expect(scanner.scanImageBuffer(createValidPng(), 'photo.png')).rejects.toThrow(AntivirusThreatError);
    });
  });

  it('configured ClamAV rejects malformed daemon responses rather than using built-in fallback', async () => {
    await withClamReply('stream: scan failed ERROR', async () => {
      await expect(scanner.scanImageBuffer(createValidPng(), 'photo.png')).rejects.toMatchObject({
        threatType: 'CLAMAV_UNAVAILABLE',
      });
    });
  });

  it('configured ClamAV rejects an unavailable daemon rather than using built-in fallback', async () => {
    await withClamReply('stream: OK', async () => {
      process.env.CLAMAV_PORT = '0';
      await expect(scanner.scanImageBuffer(createValidPng(), 'photo.png')).rejects.toMatchObject({
        threatType: 'CLAMAV_UNAVAILABLE',
      });
    });
  });

  it('configured missing ClamAV Unix socket fails closed even without CLAMAV_HOST', async () => {
    const previous = {
      host: process.env.CLAMAV_HOST,
      socket: process.env.CLAMAV_SOCKET,
    };
    delete process.env.CLAMAV_HOST;
    process.env.CLAMAV_SOCKET = '/nonexistent-moneyverse-test-clamd.sock';
    try {
      await expect(scanner.scanImageBuffer(createValidPng(), 'photo.png')).rejects.toMatchObject({
        threatType: 'CLAMAV_UNAVAILABLE',
      });
    } finally {
      if (previous.host === undefined) delete process.env.CLAMAV_HOST;
      else process.env.CLAMAV_HOST = previous.host;
      if (previous.socket === undefined) delete process.env.CLAMAV_SOCKET;
      else process.env.CLAMAV_SOCKET = previous.socket;
    }
  });

  it('configured ClamAV times out closed rather than accepting a signature-only scan', async () => {
    await withClamReply(null, async () => {
      await expect(scanner.scanImageBuffer(createValidPng(), 'photo.png')).rejects.toMatchObject({
        threatType: 'CLAMAV_UNAVAILABLE',
      });
    });
  }, 6000);

  it('without explicit configuration retains safe default daemon auto-discovery or built-in scanning', async () => {
    const previous = {
      host: process.env.CLAMAV_HOST,
      socket: process.env.CLAMAV_SOCKET,
    };
    delete process.env.CLAMAV_HOST;
    delete process.env.CLAMAV_SOCKET;
    try {
      const result = await scanner.scanImageBuffer(createValidPng(), 'photo.png');
      expect(['clamav', 'builtin-signatures']).toContain(result.scannedWith);
    } finally {
      if (previous.host === undefined) delete process.env.CLAMAV_HOST;
      else process.env.CLAMAV_HOST = previous.host;
      if (previous.socket === undefined) delete process.env.CLAMAV_SOCKET;
      else process.env.CLAMAV_SOCKET = previous.socket;
    }
  });

  it('configured ClamAV rejects a valid malware FOUND reply', async () => {
    await withClamReply('stream: Eicar-Test-Signature FOUND', async () => {
      await expect(scanner.scanImageBuffer(createValidPng(), 'photo.png')).rejects.toMatchObject({
        threatType: 'CLAMAV_DETECTED',
      });
    });
  });

  it('해상도 제한(8000px 초과) 위반 시 차단한다', async () => {
    const hugePng = createValidPng(9000, 100);
    await expect(scanner.scanImageBuffer(hugePng, 'huge.png')).rejects.toThrow(AntivirusThreatError);
  });
});
