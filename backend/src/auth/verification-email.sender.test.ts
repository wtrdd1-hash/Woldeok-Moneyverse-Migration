import { createServer, type Socket } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { VerificationEmailSender } from './verification-email.sender';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

function scriptedSmtpServer() {
  const received: string[] = [];
  let dataMode = false;
  const server = createServer((socket: Socket) => {
    socket.write('220 test-smtp ESMTP\r\n');
    let buffer = '';
    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      while (buffer.includes('\r\n')) {
        const index = buffer.indexOf('\r\n');
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);
        received.push(line);
        if (dataMode) {
          if (line === '.') {
            dataMode = false;
            socket.write('250 queued\r\n');
          }
          continue;
        }
        if (line.startsWith('EHLO ')) socket.write('250-test\r\n250 AUTH LOGIN\r\n');
        else if (line === 'AUTH LOGIN') socket.write('334 VXNlcm5hbWU6\r\n');
        else if (line === Buffer.from('mailer').toString('base64')) socket.write('334 UGFzc3dvcmQ6\r\n');
        else if (line === Buffer.from('secret').toString('base64')) socket.write('235 authenticated\r\n');
        else if (line.startsWith('MAIL FROM:')) socket.write('250 sender ok\r\n');
        else if (line.startsWith('RCPT TO:')) socket.write('250 recipient ok\r\n');
        else if (line === 'DATA') {
          dataMode = true;
          socket.write('354 end with dot\r\n');
        } else if (line === 'QUIT') socket.write('221 bye\r\n');
      }
    });
  });
  return { server, received };
}

describe('VerificationEmailSender', () => {
  it('delivers a verification link over configured SMTP', async () => {
    const { server, received } = scriptedSmtpServer();
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('missing SMTP test address');

    process.env.SMTP_HOST = '127.0.0.1';
    process.env.SMTP_PORT = String(address.port);
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USERNAME = 'mailer';
    process.env.SMTP_PASSWORD = 'secret';
    process.env.SMTP_FROM = 'no-reply@easy-scraping.com';

    try {
      await new VerificationEmailSender().send({
        to: 'member@example.com',
        token: 'verification-token-value',
        baseUrl: 'https://easy-scraping.com/',
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }

    expect(received).toContain('MAIL FROM:<no-reply@easy-scraping.com>');
    expect(received).toContain('RCPT TO:<member@example.com>');
    expect(received.join('\n')).toContain(
      'https://easy-scraping.com/verify-email?token=verification-token-value',
    );
  });

  it('fails closed when SMTP credentials are not configured', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USERNAME;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM;

    await expect(
      new VerificationEmailSender().send({
        to: 'member@example.com',
        token: 'token',
        baseUrl: 'https://easy-scraping.com/',
      }),
    ).rejects.toThrow('verification email delivery unavailable');
  });
});
