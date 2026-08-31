import { describe, expect, it } from 'vitest';
import { ImageUploadError, imageDimensions, validateImageUpload } from './image-upload-validation';

/** A PNG whose IHDR declares the size asked for. Nothing after IHDR is read. */
function png(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(64);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write('IHDR', 12, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

/**
 * A JPEG with `padding` bytes of metadata before the frame header, so the
 * tests exercise the segment walk rather than a fixed offset -- an encoder
 * that writes EXIF puts tens of kilobytes there.
 */
function jpeg(width: number, height: number, padding = 0): Buffer {
  const parts: Buffer[] = [Buffer.from([0xff, 0xd8])];
  if (padding > 0) {
    const app = Buffer.alloc(padding + 4);
    app.writeUInt8(0xff, 0);
    app.writeUInt8(0xe1, 1);
    app.writeUInt16BE(padding + 2, 2);
    parts.push(app);
  }
  const sof = Buffer.alloc(19);
  sof.writeUInt8(0xff, 0);
  sof.writeUInt8(0xc0, 1);
  sof.writeUInt16BE(17, 2);
  sof.writeUInt8(8, 4);
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);
  return Buffer.concat([...parts, sof, Buffer.alloc(16)]);
}

function webpLossy(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(64);
  buffer.write('RIFF', 0, 'ascii');
  buffer.write('WEBP', 8, 'ascii');
  buffer.write('VP8 ', 12, 'ascii');
  buffer.writeUInt16LE(width, 26);
  buffer.writeUInt16LE(height, 28);
  return buffer;
}

function webpLossless(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(64);
  buffer.write('RIFF', 0, 'ascii');
  buffer.write('WEBP', 8, 'ascii');
  buffer.write('VP8L', 12, 'ascii');
  buffer.writeUInt8(0x2f, 20);
  buffer.writeUInt32LE((width - 1) | ((height - 1) << 14), 21);
  return buffer;
}

function webpExtended(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(64);
  buffer.write('RIFF', 0, 'ascii');
  buffer.write('WEBP', 8, 'ascii');
  buffer.write('VP8X', 12, 'ascii');
  buffer.writeUIntLE(width - 1, 24, 3);
  buffer.writeUIntLE(height - 1, 27, 3);
  return buffer;
}

describe('validateImageUpload', () => {
  it('accepts a PNG and reports the size its header declares', () => {
    expect(validateImageUpload(png(800, 600))).toEqual({
      mimeType: 'image/png',
      extension: 'png',
      width: 800,
      height: 600,
    });
  });

  it('accepts a JPEG whose frame header follows a large metadata segment', () => {
    expect(validateImageUpload(jpeg(1920, 1080, 4_000))).toMatchObject({
      mimeType: 'image/jpeg',
      width: 1920,
      height: 1080,
    });
  });

  it('reads all three WebP container shapes', () => {
    expect(imageDimensions(webpLossy(640, 480), 'image/webp')).toEqual({ width: 640, height: 480 });
    expect(imageDimensions(webpLossless(640, 480), 'image/webp')).toEqual({
      width: 640,
      height: 480,
    });
    expect(imageDimensions(webpExtended(640, 480), 'image/webp')).toEqual({
      width: 640,
      height: 480,
    });
  });

  // The finding this file exists for: the byte cap admitted a picture that no
  // browser could open, because a compressed image says nothing about the
  // pixels it expands to.
  it('refuses a decompression bomb that fits inside the byte cap', () => {
    expect(png(40_000, 40_000).length).toBeLessThan(8 * 1024 * 1024);
    expect(() => validateImageUpload(png(40_000, 40_000))).toThrow(ImageUploadError);
  });

  it('refuses a picture over the per-side ceiling even when its area is small', () => {
    expect(() => validateImageUpload(png(9_000, 4))).toThrow(/8000 pixels on a side/);
  });

  it('refuses a picture within both sides whose area is too large', () => {
    expect(() => validateImageUpload(png(7_000, 7_000))).toThrow(/megapixels/);
  });

  it('accepts a picture exactly at the per-side ceiling', () => {
    expect(validateImageUpload(png(8_000, 4_000)).width).toBe(8_000);
  });

  it('refuses a file whose header declares no readable size', () => {
    const headerless = Buffer.alloc(64);
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(headerless, 0);
    expect(() => validateImageUpload(headerless)).toThrow(/readable size/);
  });

  it('refuses a zero-sided picture', () => {
    expect(() => validateImageUpload(png(0, 100))).toThrow(/readable size/);
  });

  // A JPEG whose segment lengths never advance used to be possible input for
  // an offset walk; the parser must give up rather than spin.
  it('gives up on a JPEG whose segment length cannot advance', () => {
    const stuck = Buffer.alloc(64);
    stuck.writeUInt8(0xff, 0);
    stuck.writeUInt8(0xd8, 1);
    stuck.writeUInt8(0xff, 2);
    stuck.writeUInt8(0xe0, 3);
    stuck.writeUInt16BE(0, 4);
    expect(() => validateImageUpload(stuck)).toThrow(/readable size/);
  });

  it('gives up on a JPEG that reaches its scan without a frame header', () => {
    const scanned = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xda, 0x00, 0x02]),
      Buffer.alloc(32),
    ]);
    expect(() => validateImageUpload(scanned)).toThrow(/readable size/);
  });

  it('still refuses bytes that are not an image at all', () => {
    expect(() => validateImageUpload(Buffer.alloc(64))).toThrow(/PNG, JPEG and WebP/);
  });

  it('still refuses something that is not a buffer', () => {
    expect(() => validateImageUpload('a picture')).toThrow(/12 bytes and 8 MiB/);
  });
});
