import { describe, expect, it } from 'vitest';
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

  it('해상도 제한(8000px 초과) 위반 시 차단한다', async () => {
    const hugePng = createValidPng(9000, 100);
    await expect(scanner.scanImageBuffer(hugePng, 'huge.png')).rejects.toThrow(AntivirusThreatError);
  });
});
