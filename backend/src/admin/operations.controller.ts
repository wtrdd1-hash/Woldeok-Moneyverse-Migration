import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure, isMalformedInput, isRoleRefusal } from '../core/pg-error';
import { OperationsInputError, OperationsRepository } from './operations.repository';

/**
 * The three operations screens spec 14.9 lists and this build did not have:
 * 작업·직업, 은행·대출 and Discord.
 *
 * THREE CONTROLLERS, NOT ONE. The audit trail derives an event's `feature`
 * from the first path segment under `/admin` (`featureFromPath` in
 * `audit-context.ts`), so `/admin/work`, `/admin/bank` and `/admin/discord`
 * record as `work`, `bank` and `discord` and are searchable by feature in the
 * log screen. One controller with three sub-paths would have recorded all
 * three under whatever prefix it claimed.
 *
 * READS ONLY, AND SO NO STEP-UP. `CsrfGuard`, `ReauthGuard` and
 * `SecondFactorGuard` are absent because nothing here writes. Asking for an
 * authenticator code to read a number is how operators learn to type codes
 * without reading what they are for -- the same reasoning
 * `AdminEconomyController` gives for its preview route.
 *
 * The view itself is still recorded: `adminAuditTrail` writes one audit row
 * per request under `/api/v1/admin` through `admin_record_console_access`,
 * which is what 14.9 asks for when it says every console view is logged.
 */

/** One request per screen: each handler issues its reads together. */
function required(repository: OperationsRepository | null): OperationsRepository {
  if (!repository) {
    throw new ServiceUnavailableException('the operations console is unavailable');
  }
  return repository;
}

/**
 * 42501 from one of these functions is the role refusal working, and belongs
 * to the caller as a 403. PostgreSQL's own "permission denied for ..." is a
 * missing GRANT and is deliberately not caught, so a broken deployment stays
 * a 500 that somebody has to look at.
 */
async function guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
  try {
    return await work();
  } catch (error: unknown) {
    if (error instanceof OperationsInputError) throw new BadRequestException(error.message);
    if (isRoleRefusal(error)) throw new ForbiddenException('this screen needs a higher role');
    if (isMalformedInput(error)) throw new BadRequestException(message);
    if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
    throw error;
  }
}

@ApiTags('admin')
@Controller('admin/work')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminWorkOperationsController {
  constructor(
    @Inject(OperationsRepository) private readonly operations: OperationsRepository | null,
  ) {}

  @Get()
  @ApiOperation({ summary: 'The work catalogue, the reward policy in force, and job levels' })
  async overview(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const [catalogue, jobLevels, policy] = await guarded(
      () =>
        Promise.all([
          repository.workCatalogue(actor),
          repository.jobLevels(actor),
          repository.workRewardPolicy(actor),
        ]),
      'the work console could not be read',
    );
    return { catalogue, jobLevels, policy };
  }
}

@ApiTags('admin')
@Controller('admin/bank')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminBankOperationsController {
  constructor(
    @Inject(OperationsRepository) private readonly operations: OperationsRepository | null,
  ) {}

  /**
   * `limit` bounds the loan book alone. The totals beside it come from
   * `admin_bank_overview`, which counts the whole book -- a total added up
   * from a page of fifty would be a subtotal presented as a total.
   */
  @Get()
  @ApiOperation({ summary: 'Deposits and the loan book, with the credit ladder behind it' })
  async overview(@Req() request: RequestWithSession, @Query('limit') limit?: string) {
    const requested = limit === undefined ? undefined : Number(limit);
    if (requested !== undefined && !Number.isSafeInteger(requested)) {
      throw new BadRequestException('limit must be a whole number');
    }
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const [overview, grades, loans] = await guarded(
      () =>
        Promise.all([
          repository.bankOverview(actor),
          repository.creditGrades(actor),
          requested === undefined
            ? repository.loanBook(actor)
            : repository.loanBook(actor, requested),
        ]),
      'the bank console could not be read',
    );
    return { overview, grades, loans };
  }
}

@ApiTags('admin')
@Controller('admin/discord')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class AdminDiscordOperationsController {
  constructor(
    @Inject(OperationsRepository) private readonly operations: OperationsRepository | null,
  ) {}

  /**
   * The routing table and the outbox backlog. The recent-deliveries list is a
   * different question and stays where it is, beside the audit trail at
   * `GET /admin/discord-outbox-events`.
   */
  @Get()
  @ApiOperation({ summary: 'Discord delivery: which types are routed, and what is stuck' })
  async overview(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    const repository = required(this.operations);
    const [outbox, routes] = await guarded(
      () => Promise.all([repository.outboxHealth(actor), repository.discordRoutes(actor)]),
      'the delivery console could not be read',
    );
    return { outbox, routes };
  }
}
