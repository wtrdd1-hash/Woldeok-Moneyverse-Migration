const MAX_BYTES = 8 * 1024 * 1024;

export class ImageUploadError extends Error {}

/**
 * The largest picture this product will hold.
 *
 * Magic numbers say the bytes are an image; they say nothing about how big an
 * image. A conforming 8 MiB PNG can declare 40000x40000, which decompresses to
 * six gigabytes in whichever browser opens it -- and the server would have
 * stored and served it without ever noticing, because nothing here decodes an
 * upload. 17.x asks for a bound on what an upload may be, and a size in bytes
 * is not that bound.
 *
 * The ceiling is read out of the header rather than by decoding: every format
 * accepted here writes its dimensions in the first few dozen bytes, so the
 * check costs nothing and needs no decoder to attack.
 */
const MAX_SIDE = 8_000;
const MAX_PIXELS = 40_000_000;

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

function pngSize(buffer: Buffer): ImageDimensions | null {
  // Width and height live in IHDR, which the format requires to be the first
  // chunk -- so its position is fixed and there is nothing to scan.
  if (buffer.length < 24 || buffer.subarray(12, 16).toString('ascii') !== 'IHDR') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function jpegSize(buffer: Buffer): ImageDimensions | null {
  // JPEG has no fixed offset: the frame header sits after however many
  // metadata segments the encoder wrote, and EXIF alone can be tens of
  // kilobytes. Walk the segment lengths rather than searching for a pattern,
  // which would match inside a thumbnail.
  let at = 2;
  while (at + 9 < buffer.length) {
    if (buffer[at] !== 0xff) return null;
    const marker = buffer[at + 1] ?? 0;
    // Standalone markers carry no length; RSTn and TEM are the only ones that
    // can appear here, and skipping two bytes is the whole handling.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      at += 2;
      continue;
    }
    const length = buffer.readUInt16BE(at + 2);
    // A length below two cannot advance, and a segment claiming to run past
    // the buffer is malformed. Either would spin this loop forever.
    if (length < 2 || at + 2 + length > buffer.length) return null;
    // SOF0..SOF15 are the frame headers, all shaped alike. DHT, JPG and DAC
    // share the range and are not frames.
    const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrame) return { height: buffer.readUInt16BE(at + 5), width: buffer.readUInt16BE(at + 7) };
    // Start of scan: the entropy-coded data follows and there is no frame
    // header after it. Stopping is the honest answer.
    if (marker === 0xda) return null;
    at += 2 + length;
  }
  return null;
}

function webpSize(buffer: Buffer): ImageDimensions | null {
  // Three container shapes, and a real encoder emits all three: VP8 for
  // lossy, VP8L for lossless, VP8X whenever alpha or animation is present.
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8 ' && buffer.length >= 30) {
    // The 14 low bits are the dimension; the top two are the scale.
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L' && buffer.length >= 25 && buffer[20] === 0x2f) {
    // Fourteen bits each, stored one less than the true size, packed across
    // four little-endian bytes with no alignment to spare.
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X' && buffer.length >= 30) {
    // Canvas size, 24-bit little-endian, also stored one less.
    const at24 = (offset: number): number =>
      (buffer[offset] ?? 0) | ((buffer[offset + 1] ?? 0) << 8) | ((buffer[offset + 2] ?? 0) << 16);
    return { width: at24(24) + 1, height: at24(27) + 1 };
  }
  return null;
}

export function imageDimensions(buffer: Buffer, mimeType: string): ImageDimensions | null {
  if (mimeType === 'image/png') return pngSize(buffer);
  if (mimeType === 'image/jpeg') return jpegSize(buffer);
  if (mimeType === 'image/webp') return webpSize(buffer);
  return null;
}

export interface ValidatedImage {
  readonly mimeType: string;
  readonly extension: string;
  readonly width: number;
  readonly height: number;
}

function format(buffer: Buffer): Omit<ValidatedImage, 'width' | 'height'> {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return { mimeType: 'image/png', extension: 'png' };
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  )
    return { mimeType: 'image/webp', extension: 'webp' };
  throw new ImageUploadError('only PNG, JPEG and WebP image bytes are allowed');
}

export function validateImageUpload(buffer: unknown): ValidatedImage {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12 || buffer.length > MAX_BYTES)
    throw new ImageUploadError('image must be between 12 bytes and 8 MiB');
  const kind = format(buffer);

  const size = imageDimensions(buffer, kind.mimeType);
  // Unreadable dimensions are a refusal, not a pass. The point of the ceiling
  // is that nothing unbounded gets stored, and a file whose header this cannot
  // read is precisely the file whose bounds are unknown -- every encoder that
  // writes these three formats puts the size where it is looked for here.
  if (!size || size.width < 1 || size.height < 1)
    throw new ImageUploadError('image header does not declare a readable size');
  if (size.width > MAX_SIDE || size.height > MAX_SIDE)
    throw new ImageUploadError(`image may not exceed ${MAX_SIDE} pixels on a side`);
  if (size.width * size.height > MAX_PIXELS)
    throw new ImageUploadError(`image may not exceed ${MAX_PIXELS / 1_000_000} megapixels`);

  return { ...kind, width: size.width, height: size.height };
}
