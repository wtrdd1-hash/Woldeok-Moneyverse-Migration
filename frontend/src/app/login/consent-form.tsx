'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { IDLE } from '@/lib/action-state';
import { submitConsent } from './actions';
import { useLocale } from '@/components/locale-provider';
import { pick } from '@/lib/copy';
import { CONSENT_COPY } from './copy';

/**
 * The gate a visitor passes before any provider button appears.
 *
 * The consent boxes stay disabled until the document above each has been
 * scrolled to its end. That is the original's rule, kept — a consent record
 * that says "read to the end" has to mean it — but expressed without the
 * original's two `<iframe>`s: the documents are components on this page, so
 * they inherit the theme, are reachable by keyboard, and cost no extra
 * requests.
 *
 * Scrolling is not the only way to reach the end. A short viewport, a
 * zoomed-in reader or a keyboard user paging with End all reach it, and each
 * fires the same scroll event. A panel too short to scroll counts as read on
 * mount, because there is nothing left to reach.
 */
export function ConsentForm({
  termsVersion,
  privacyVersion,
  terms,
  privacy,
  error,
}: {
  readonly termsVersion: string;
  readonly privacyVersion: string;
  readonly terms: React.ReactNode;
  readonly privacy: React.ReactNode;
  readonly error?: string | undefined;
}) {
  const { locale } = useLocale();
  const t = (key: keyof typeof CONSENT_COPY) => pick(locale, CONSENT_COPY[key]);
  const [state, action] = useActionState(submitConsent, IDLE);
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [accepted, setAccepted] = useState({ terms: false, privacy: false, age: false });

  useEffect(() => {
    // Intercept back-button navigation to prevent bypassing required consent
    window.history.pushState({ page: 'consent-guard' }, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState({ page: 'consent-guard' }, '', window.location.href);
      alert(t('backBlocked'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const ready = accepted.terms && accepted.privacy && accepted.age;

  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="termsVersion" value={termsVersion} />
      <input type="hidden" name="privacyVersion" value={privacyVersion} />

      {error && (
        <ActionAlert state={{ status: 'error', message: error }} />
      )}

      <Document
        title={t('termsTitle')}
        version={termsVersion}
        href="/terms"
        onRead={() => setTermsRead(true)}
      >
        {terms}
      </Document>
      <Acknowledgement
        name="terms"
        disabled={!termsRead}
        checked={accepted.terms}
        onChange={(value) => setAccepted((current) => ({ ...current, terms: value }))}
        label={t('termsAgree')}
        hint={t('readHint')}
      />

      <Document
        title={t('privacyTitle')}
        version={privacyVersion}
        href="/privacy"
        onRead={() => setPrivacyRead(true)}
      >
        {privacy}
      </Document>
      <Acknowledgement
        name="privacy"
        disabled={!privacyRead}
        checked={accepted.privacy}
        onChange={(value) => setAccepted((current) => ({ ...current, privacy: value }))}
        label={t('privacyAgree')}
        hint={t('readHint')}
      />

      <Acknowledgement
        name="age"
        checked={accepted.age}
        onChange={(value) => setAccepted((current) => ({ ...current, age: value }))}
        label={t('age')}
      />

      <ActionAlert state={state} />

      <SubmitButton disabled={!ready} className="w-full sm:w-fit">
        {t('submit')}
      </SubmitButton>
    </form>
  );
}

function Document({
  title,
  version,
  href,
  onRead,
  children,
}: {
  readonly title: string;
  readonly version: string;
  readonly href: string;
  readonly onRead: () => void;
  readonly children: React.ReactNode;
}) {
  const { locale } = useLocale();
  // A few pixels of slack: sub-pixel layout and browser zoom mean the
  // arithmetic rarely lands exactly on zero.
  function checkReachedEnd(element: HTMLElement) {
    if (element.scrollHeight - element.scrollTop - element.clientHeight <= 8) onRead();
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-base">
          {title} <span className="text-xs font-normal text-muted-foreground">v{version}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {pick(locale, CONSENT_COPY.docHint)}{' '}
          <Link href={href} target="_blank" rel="noopener" className="text-primary">
            {pick(locale, CONSENT_COPY.openNew)}
          </Link>
        </p>
      </CardHeader>
      <CardContent>
        <div
          // Checked on mount as well as on scroll: a panel that is not
          // scrollable at all — a tall window, a large zoom-out — has no end
          // left to reach, and gating the checkbox on a scroll event that can
          // never fire would lock the visitor out of signing in.
          ref={(element) => {
            if (element) checkReachedEnd(element);
          }}
          tabIndex={0}
          role="region"
          aria-label={pick(locale, CONSENT_COPY.fullText).replace('{title}', title)}
          onScroll={(event) => checkReachedEnd(event.currentTarget)}
          className="h-72 overflow-y-auto rounded-md border p-4"
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function Acknowledgement({
  name,
  label,
  hint,
  checked,
  disabled = false,
  onChange,
}: {
  readonly name: string;
  readonly label: string;
  readonly hint?: string;
  readonly checked: boolean;
  readonly disabled?: boolean;
  readonly onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={`consent-${name}`}
        name={name}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-1 size-5"
      />
      <div className="grid gap-0.5">
        <Label htmlFor={`consent-${name}`} className="text-sm font-normal">
          {label}
        </Label>
        {hint && disabled && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
