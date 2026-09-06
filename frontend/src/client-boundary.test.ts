import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * A value exported from a client module and read by a server one.
 *
 * Everything a `'use client'` module exports crosses the boundary as a client
 * *reference*: a component renders from it, and anything else -- an array, a
 * map, a helper -- arrives at a server component as a proxy that is not the
 * value. `STRENGTHS.find is not a function` was that, in production, on the
 * console's market page, and only once there was an event to label: the call
 * sat inside a branch that an empty list never reached, so the screen worked
 * until the first headline was published and then answered every load with
 * the error boundary.
 *
 * A build does not catch it and neither does a type: both modules type-check,
 * and the proxy only fails when something reaches through it. So the guard is
 * this -- read the tree and assert the boundary is not crossed by a value.
 */
const ROOT = resolve(__dirname);

function sources(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...sources(path));
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) found.push(path);
  }
  return found;
}

const isClientModule = (text: string): boolean => /^\s*(['"])use client\1/.test(text);

/** PascalCase is a component; anything else is a value the server cannot hold. */
function valueExports(text: string): string[] {
  const names: string[] = [];
  for (const match of text.matchAll(/^export (?:const|function|let) ([A-Za-z_$][\w$]*)/gm)) {
    const name = match[1] as string;
    if (!/^[A-Z][a-z]/.test(name)) names.push(name);
  }
  return names;
}

/** Only value imports: a type import is erased before anything runs. */
function importedNames(text: string, fromSuffix: string): string[] {
  const names: string[] = [];
  for (const match of text.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/g)) {
    if (match[1]) continue;
    const specifier = match[3] as string;
    if (!specifier.endsWith(fromSuffix)) continue;
    for (const piece of (match[2] as string).split(',')) {
      const name = piece.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]?.trim();
      if (name) names.push(name);
    }
  }
  return names;
}

describe('the client boundary', () => {
  it('is not crossed by a value a server component then reaches into', () => {
    const files = sources(ROOT);
    const read = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]));
    const crossings: string[] = [];

    for (const [file, text] of read) {
      if (!isClientModule(text)) continue;
      const exported = new Set(valueExports(text));
      if (exported.size === 0) continue;
      const suffix = `/${file.split('/').pop()!.replace(/\.tsx?$/, '')}`;

      for (const [other, otherText] of read) {
        if (other === file || isClientModule(otherText)) continue;
        for (const name of importedNames(otherText, suffix)) {
          if (exported.has(name)) {
            crossings.push(`${name} from ${relative(ROOT, file)} into ${relative(ROOT, other)}`);
          }
        }
      }
    }

    expect(crossings).toEqual([]);
  });
});
