import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  DETECTED_LOCALE_COOKIE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from './locale';

/**
 * Server-only helper to read the active locale from cookies.
 */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const explicit = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(explicit)) return explicit;
  const detected = cookieStore.get(DETECTED_LOCALE_COOKIE)?.value;
  if (isLocale(detected)) return detected;
  return DEFAULT_LOCALE;
}
