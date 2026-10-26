import type { ArgumentsHost } from '@nestjs/common';
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ProblemFilter } from './problem.filter';

function hostFor(): {
  host: ArgumentsHost;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  type: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const type = vi.fn();
  const response = { status: vi.fn(), type, json };
  response.status.mockReturnValue(response);
  type.mockReturnValue(response);
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ url: '/api/v1/things' }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status: response.status, json, type };
}

describe('ProblemFilter', () => {
  it('maps a NotFoundException to a 404 problem document', () => {
    const { host, status, json } = hostFor();
    new ProblemFilter(false).catch(new NotFoundException('no such thing'), host);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 404, title: 'Not Found', detail: 'no such thing' }),
    );
  });

  it('serves the problem+json media type', () => {
    const { host, type } = hostFor();
    new ProblemFilter(false).catch(new NotFoundException(), host);
    expect(type).toHaveBeenCalledWith('application/problem+json');
  });

  it('collects validation messages into an errors array', () => {
    const { host, json } = hostFor();
    const exception = new BadRequestException({
      message: ['amount must be a positive integer', 'recipientId must be a UUID'],
      error: 'Bad Request',
      statusCode: 400,
    });
    new ProblemFilter(false).catch(exception, host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        errors: ['amount must be a positive integer', 'recipientId must be a UUID'],
      }),
    );
  });

  it('answers 500 with a fixed detail for an unrecognised error', () => {
    const { host, status, json } = hostFor();
    new ProblemFilter(true).catch(new Error('connection string parse failure'), host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500, detail: 'internal server error' }),
    );
  });

  // Driver errors routinely quote the connection string or the failing query.
  it('never leaks an internal message in production', () => {
    const { host, json } = hostFor();
    new ProblemFilter(true).catch(new Error('password=hunter2'), host);
    expect(JSON.stringify(json.mock.calls[0])).not.toContain('hunter2');
  });

  it('redacts internal 503 HttpException details and validation arrays in production', () => {
    const { host, json } = hostFor();
    new ProblemFilter(true).catch(
      new HttpException({
        message: 'upstream request failed: password=private-db-password',
        errors: ['secret token was rejected'],
        code: 'UPSTREAM_UNAVAILABLE',
      }, 503),
      host,
    );
    const [document] = json.mock.calls[0] as [Record<string, unknown>];
    expect(document).toMatchObject({ status: 503, code: 'UPSTREAM_UNAVAILABLE', detail: 'service temporarily unavailable' });
    expect('errors' in document).toBe(false);
    expect(JSON.stringify(document)).not.toContain('private-db-password');
    expect(JSON.stringify(document)).not.toContain('secret token');
  });

  it('redacts explicit 500 HttpException detail while retaining safe 4xx diagnostics', () => {
    const internal = hostFor();
    new ProblemFilter(true).catch(new HttpException('query failed: password=secret', 500), internal.host);
    expect(JSON.stringify(internal.json.mock.calls[0])).not.toContain('password=secret');
    const client = hostFor();
    new ProblemFilter(true).catch(new BadRequestException('invalid amount'), client.host);
    expect(client.json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'invalid amount' }));
  });

  it('rejects malformed 5xx machine codes that could carry raw upstream text', () => {
    const { host, json } = hostFor();
    new ProblemFilter(true).catch(
      new HttpException({ message: 'provider failed', code: 'database password=secret' }, 503),
      host,
    );
    const [document] = json.mock.calls[0] as [Record<string, unknown>];
    expect('code' in document).toBe(false);
    expect(JSON.stringify(document)).not.toContain('password=secret');
  });

  it('retains explicit 5xx diagnostics for isolated development debugging', () => {
    const { host, json } = hostFor();
    new ProblemFilter(false).catch(new HttpException('development query detail', 503), host);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ detail: 'development query detail' }));
  });

  it('does describe an unrecognised error outside production', () => {
    const { host, json } = hostFor();
    new ProblemFilter(false).catch(new Error('a useful development message'), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'a useful development message' }),
    );
  });

  it('does not describe a thrown non-Error even outside production', () => {
    const { host, json } = hostFor();
    new ProblemFilter(false).catch('a bare string', host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500, detail: 'internal server error' }),
    );
  });

  it('preserves a deliberate HttpException status such as 428', () => {
    const { host, status, json } = hostFor();
    new ProblemFilter(false).catch(
      new HttpException('consent required', HttpStatus.PRECONDITION_REQUIRED),
      host,
    );
    expect(status).toHaveBeenCalledWith(428);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ title: 'Precondition Required' }));
  });

  it('omits detail and errors rather than emitting undefined values', () => {
    const { host, json } = hostFor();
    new ProblemFilter(false).catch(new HttpException({}, 409), host);
    const [document] = json.mock.calls[0] as [Record<string, unknown>];
    expect('detail' in document).toBe(false);
    expect('errors' in document).toBe(false);
    expect('code' in document).toBe(false);
  });

  it('carries a refusal code so two 401s can be told apart', () => {
    const { host, json } = hostFor();
    new ProblemFilter(true).catch(
      new HttpException({ message: 'recent reauthentication required', code: 'reauthentication_required' }, 401),
      host,
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401,
        detail: 'recent reauthentication required',
        code: 'reauthentication_required',
      }),
    );
  });

  it('ignores a code that is not a string', () => {
    const { host, json } = hostFor();
    new ProblemFilter(false).catch(new HttpException({ message: 'no', code: 7 }, 400), host);
    const [document] = json.mock.calls[0] as [Record<string, unknown>];
    expect('code' in document).toBe(false);
  });
});
