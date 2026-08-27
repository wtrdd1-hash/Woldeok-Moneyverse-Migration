import { Injectable } from '@nestjs/common';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { validateImageUpload } from './image-upload-validation';

export interface StoredImage {
  readonly storageKey: string;
  readonly mimeType: string;
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

/**
 * Stores uploaded images under an opaque, server-generated filename. `read`'s
 * anchored pattern (36 hex/dash characters, one dot, a fixed extension) is the
 * only gate a storage key passes before `path.join`: it admits no `/`, `\`,
 * or extra `.`, so a caller-supplied key can never address a path outside
 * `directory`. Note that the route matcher in the server compares the same
 * shape case-insensitively while this one does not; keys are always generated
 * lowercase by `randomUUID` plus a fixed extension, so the two agree in
 * practice, and this is the stricter of the pair.
 */
@Injectable()
export class PrivateImageStorage {
  readonly directory: string;

  constructor(directory: string) {
    if (typeof directory !== 'string' || !path.isAbsolute(directory)) {
      throw new TypeError('an absolute image storage directory is required');
    }
    this.directory = directory;
  }

  async save(buffer: Buffer): Promise<StoredImage> {
    const image = validateImageUpload(buffer);
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const storageKey = `${randomUUID()}.${image.extension}`;
    await writeFile(path.join(this.directory, storageKey), buffer, { mode: 0o600, flag: 'wx' });
    return { storageKey, mimeType: image.mimeType };
  }

  async read(storageKey: unknown): Promise<Buffer | null> {
    if (typeof storageKey !== 'string' || !/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(storageKey))
      return null;
    try {
      return await readFile(path.join(this.directory, storageKey));
    } catch (error) {
      if (isErrnoException(error) && error.code === 'ENOENT') return null;
      throw error;
    }
  }
}
