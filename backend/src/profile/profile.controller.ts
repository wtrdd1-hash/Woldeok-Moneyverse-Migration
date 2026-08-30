import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import { ProfileUpdateDto } from './profile.dto';
import { ProfileInputError, ProfileRepository } from './profile.repository';

/** How a 28000 reads on this route. It means different things on each. */
interface Refusal {
  readonly denied: () => Error;
  readonly conflict: string;
}

/**
 * Member profiles, and who each field is shown to.
 *
 * Nothing here decides visibility. The session's member id is handed to
 * `member_profile_view` as the actor and the function applies
 * `member_field_visible` per field; 080 deliberately withholds that helper
 * from moneyverse_app, so the application could not second-guess it even by
 * accident.
 *
 * Every route carries a session, including the read of somebody else's
 * profile. `member_profile_view` does accept a null actor and would answer a
 * 'public' profile for a visitor, and taking that up would mean resolving a
 * session cookie outside SessionGuard -- a second path into session
 * resolution, written for a page nobody has asked for. The cost is that
 * 'public' and 'members' currently reach the same audience through this API.
 * That errs towards the member's privacy rather than away from it, and the
 * day an anonymous profile page exists it needs an optional-session guard
 * rather than a change to any of this.
 *
 * Guard order is semantic. SessionGuard resolves the session onto the request
 * and everything after it reads what that attached; CsrfGuard cannot verify a
 * token without a session id. CsrfGuard sits at class level and exits early on
 * GET, HEAD and OPTIONS, so the two reads below are not asked for a token
 * while the replacement is.
 */
@ApiTags('profile')
@Controller('profile')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class ProfileController {
  constructor(@Inject(ProfileRepository) private readonly profiles: ProfileRepository | null) {}

  private repository(): ProfileRepository {
    if (!this.profiles) throw new ServiceUnavailableException('profiles are unavailable');
    return this.profiles;
  }

  /**
   * 22023 is a request the rules refuse -- a title that was never awarded is
   * the only one local validation cannot catch first. 28000 is the caller
   * being refused rather than the request, and the two routes answer it
   * differently, which is why the refusal is per call rather than one
   * sentence for all of them.
   *
   * 42501 is absent on purpose: neither function raises it deliberately, so
   * the only way to see one here is a lost GRANT. That is a broken deployment
   * and it must stay a 500 and page somebody rather than be reported to a
   * member as their mistake -- as must anything else, which is what the last
   * line is for.
   */
  private async guarded<T>(work: () => Promise<T>, refusal: Refusal): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof ProfileInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw refusal.denied();
      if (isExpectedCommandFailure(error)) throw new ConflictException(refusal.conflict);
      throw error;
    }
  }

  /**
   * One answer for "no such member", "that account is closed" and "that
   * profile is not shown to you". 080 gives all three the same sentence for
   * the same reason MediaController gives one 404 to three states: a 403
   * would confirm that the id names a real, active member and that only their
   * settings stopped the caller, which is exactly the fact the shared message
   * withholds. Distinguishing them here would hand an enumerator the
   * membership list one id at a time.
   */
  private static readonly HIDDEN: Refusal = {
    denied: () => new NotFoundException('no profile is available here'),
    conflict: 'the profile is unavailable',
  };

  /**
   * The caller's own profile. Identical to asking for their own id below --
   * 080 answers with every field when the actor is the subject -- and it
   * exists so a screen does not have to be told which member it belongs to.
   */
  @Get()
  @ApiOperation({ summary: 'The caller’s own profile, with every field' })
  async mine(@Req() request: RequestWithSession) {
    const actor = requireUserId(request);
    return {
      profile: await this.guarded(
        () => this.repository().view(actor, actor),
        ProfileController.HIDDEN,
      ),
    };
  }

  /**
   * The caller's own settings, including the per-field visibility map that
   * `GET /profile` cannot return -- that route answers what a reader sees,
   * and a control panel needs what is stored. Its own route rather than a
   * field on the profile, because only the owner may ever read this and
   * putting it on a shape another member also receives invites the mistake.
   */
  @Get('settings')
  @ApiOperation({ summary: 'The caller’s own profile settings, as stored' })
  async settings(@Req() request: RequestWithSession) {
    return {
      settings: await this.guarded(
        () => this.repository().settings(requireUserId(request)),
        ProfileController.HIDDEN,
      ),
    };
  }

  /**
   * Somebody else's profile, on their terms. A field they withhold arrives as
   * null, which is a fact about what is shown rather than about what exists.
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Another member’s profile, as they have chosen to show it' })
  async member(@Req() request: RequestWithSession, @Param('userId', ParseUUIDPipe) userId: string) {
    return {
      profile: await this.guarded(
        () => this.repository().view(requireUserId(request), userId),
        ProfileController.HIDDEN,
      ),
    };
  }

  /**
   * A replacement of the whole profile, so an omitted field is cleared rather
   * than kept -- `ProfileRepository.update` says why a merge is not on offer.
   *
   * Answered with the stored settings under `settings` rather than `profile`,
   * because they are a different shape from what the reads return: these are
   * what the member chose, including `field_visibility`, which no read
   * function in the schema gives back. Today this response is the only place
   * that map can be observed at all. The keys are 079's own column names, so
   * the day a read function exists the shape does not change under whoever is
   * already rendering it.
   */
  @Put()
  @ApiOperation({ summary: 'Replace the caller’s profile and its per-field visibility' })
  async replace(@Req() request: RequestWithSession, @Body() body: ProfileUpdateDto) {
    return {
      settings: await this.guarded(
        () =>
          this.repository().update(requireUserId(request), {
            visibility: body.visibility,
            displayName: body.displayName,
            imageUrl: body.imageUrl,
            fieldVisibility: body.fieldVisibility,
            featuredTitle: body.featuredTitle,
          }),
        {
          denied: () =>
            new ForbiddenException('an active membership is required to edit a profile'),
          conflict: 'the profile was not updated',
        },
      ),
    };
  }
}
