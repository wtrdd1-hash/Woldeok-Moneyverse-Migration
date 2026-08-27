import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

export interface ProblemDocument {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly errors?: string[];
}

function titleFor(status: number): string {
  const name = HttpStatus[status];
  if (name === undefined) return 'Error';
  return String(name)
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function detailOf(payload: unknown): string | undefined {
  if (typeof payload === 'string') return payload;
  if (!isRecord(payload)) return undefined;
  if (typeof payload.message === 'string') return payload.message;
  if (typeof payload.error === 'string') return payload.error;
  return undefined;
}

function errorsOf(payload: unknown): string[] | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.message)) return undefined;
  return payload.message.filter((entry): entry is string => typeof entry === 'string');
}

/**
 * RFC 9457 problem documents for every error.
 *
 * `production` decides whether an unrecognised throw may describe itself.
 * Outside production the message is useful during development; in production
 * it is a leak, because driver errors routinely quote the connection string
 * or the failing query text.
 */
@Catch()
export class ProblemFilter implements ExceptionFilter {
  constructor(private readonly production: boolean) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const problem =
      exception instanceof HttpException
        ? this.fromHttpException(exception)
        : this.fromUnknown(exception);
    response.status(problem.status).type('application/problem+json').json(problem);
  }

  private fromHttpException(exception: HttpException): ProblemDocument {
    const status = exception.getStatus();
    const payload = exception.getResponse();
    const detail = detailOf(payload);
    const errors = errorsOf(payload);
    return {
      type: 'about:blank',
      title: titleFor(status),
      status,
      // Spread rather than assign undefined: exactOptionalPropertyTypes is on,
      // and an explicit `detail: undefined` would also serialise the key.
      ...(detail === undefined ? {} : { detail }),
      ...(errors === undefined ? {} : { errors }),
    };
  }

  private fromUnknown(exception: unknown): ProblemDocument {
    return {
      type: 'about:blank',
      title: titleFor(HttpStatus.INTERNAL_SERVER_ERROR),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail:
        this.production || !(exception instanceof Error)
          ? 'internal server error'
          : exception.message,
    };
  }
}
