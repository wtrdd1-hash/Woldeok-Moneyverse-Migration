import { cookies, headers } from 'next/headers';
import {
  DEFAULT_LOCALE,
  DETECTED_LOCALE_COOKIE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from './locale';

/**
 * Read the resolved server locale. The proxy validates and normalizes the
 * internal request header using the precedence URL > manual cookie > GeoIP.
 * Reading a manual cookie before that header would incorrectly override
 * an explicit /en/... URL (and introduce an SSR/client mismatch).
 */
export async function getServerLocale(): Promise<Locale> {
  const requestLocale = (await headers()).get('x-moneyverse-locale');
  if (isLocale(requestLocale)) return requestLocale;
  const cookieStore = await cookies();
  const explicit = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(explicit)) return explicit;
  const detected = cookieStore.get(DETECTED_LOCALE_COOKIE)?.value;
  if (isLocale(detected)) return detected;
  return DEFAULT_LOCALE;
}
