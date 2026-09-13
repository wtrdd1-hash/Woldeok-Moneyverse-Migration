import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { connect as connectNet, type Socket } from 'node:net';
import { connect as connectTls, type TLSSocket } from 'node:tls';

type SmtpSocket = Socket | TLSSocket;

interface VerificationEmail {
  readonly to: string;
  readonly token: string;
  readonly baseUrl: string;
}

interface SmtpSettings {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly username: string;
  readonly password: string;
  readonly from: string;
}

function smtpSettings(env: NodeJS.ProcessEnv): SmtpSettings | null {
  const host = env.SMTP_HOST?.trim();
  const username = env.SMTP_USERNAME?.trim();
  const password = env.SMTP_PASSWORD;
  const from = env.SMTP_FROM?.trim();
  if (!host || !username || !password || !from) return null;

  const secure = env.SMTP_SECURE !== 'false';
  const parsedPort = Number(env.SMTP_PORT ?? (secure ? '465' : '587'));
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error('SMTP_PORT must be an integer from 1 to 65535');
  }
  return { host, port: parsedPort, secure, username, password, from };
}

function headerValue(value: string): string {
  return value.replace(/[\r\n]/g, ' ').trim();
}

function messageBody(input: VerificationEmail, from: string): string {
  const verifyUrl = new URL('/verify-email', input.baseUrl);
  verifyUrl.searchParams.set('token', input.token);
  const subject = 'Verify your Woldeok Moneyverse email';
  const text = [
    'Woldeok Moneyverse email verification',
    '',
    'Open the link below to finish creating your account:',
    verifyUrl.toString(),
    '',
    'If you did not request this account, you can ignore this email.',
  ].join('\r\n');

  return [
    `From: ${headerValue(from)}`,
    `To: ${headerValue(input.to)}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    text.replace(/^\./gm, '..'),
  ].join('\r\n');
}

async function openSocket(settings: SmtpSettings): Promise<SmtpSocket> {
  return await new Promise<SmtpSocket>((resolve, reject) => {
    const onError = (error: Error) => reject(error);
    const socket = settings.secure
      ? connectTls({ host: settings.host, port: settings.port, servername: settings.host }, () => {
          socket.removeListener('error', onError);
          resolve(socket);
        })
      : connectNet({ host: settings.host, port: settings.port }, () => {
          socket.removeListener('error', onError);
          resolve(socket);
        });
    socket.once('error', onError);
    socket.setTimeout(10_000, () => socket.destroy(new Error('SMTP connection timed out')));
  });
}

async function readReply(socket: SmtpSocket): Promise<{ code: number; text: string }> {
  return await new Promise((resolve, reject) => {
    let buffer = '';
    const onError = (error: Error) => cleanup(() => reject(error));
    const onData = (chunk: Buffer | string) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1);
      if (!last || !/^\d{3} /.test(last)) return;
      const code = Number(last.slice(0, 3));
      cleanup(() => resolve({ code, text: lines.join('\n') }));
    };
    const cleanup = (done: () => void) => {
      socket.removeListener('data', onData);
      socket.removeListener('error', onError);
      done();
    };
    socket.on('data', onData);
    socket.once('error', onError);
  });
}

async function command(socket: SmtpSocket, value: string, expected: readonly number[]) {
  socket.write(`${value}\r\n`);
  const reply = await readReply(socket);
  if (!expected.includes(reply.code)) throw new Error(`SMTP rejected command (${reply.code})`);
  return reply;
}

async function deliver(settings: SmtpSettings, mail: VerificationEmail): Promise<void> {
  const socket = await openSocket(settings);
  try {
    const greeting = await readReply(socket);
    if (greeting.code !== 220) throw new Error(`SMTP greeting rejected (${greeting.code})`);
    await command(socket, 'EHLO moneyverse-backend', [250]);
    await command(socket, 'AUTH LOGIN', [334]);
    await command(socket, Buffer.from(settings.username).toString('base64'), [334]);
    await command(socket, Buffer.from(settings.password).toString('base64'), [235]);
    await command(socket, `MAIL FROM:<${settings.from.replace(/[<>\r\n]/g, '')}>`, [250]);
    await command(socket, `RCPT TO:<${mail.to.replace(/[<>\r\n]/g, '')}>`, [250, 251]);
    await command(socket, 'DATA', [354]);
    socket.write(`${messageBody(mail, settings.from)}\r\n.\r\n`);
    const queued = await readReply(socket);
    if (queued.code !== 250) throw new Error(`SMTP did not queue message (${queued.code})`);
    await command(socket, 'QUIT', [221]);
  } finally {
    socket.destroy();
  }
}

@Injectable()
export class VerificationEmailSender {
  async send(input: VerificationEmail): Promise<void> {
    const settings = smtpSettings(process.env);
    if (!settings) {
      throw new ServiceUnavailableException('verification email delivery unavailable');
    }
    try {
      await deliver(settings, input);
    } catch {
      throw new ServiceUnavailableException('verification email delivery unavailable');
    }
  }
}
