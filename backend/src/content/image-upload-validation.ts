const MAX_BYTES = 8 * 1024 * 1024;

export class ImageUploadError extends Error {}

export interface ValidatedImage {
  readonly mimeType: string;
  readonly extension: string;
}

export function validateImageUpload(buffer: unknown): ValidatedImage {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12 || buffer.length > MAX_BYTES)
    throw new ImageUploadError('image must be between 12 bytes and 8 MiB');
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
