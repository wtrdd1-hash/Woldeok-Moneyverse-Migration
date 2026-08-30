import type { CanActivate, ExecutionContext } from '@nestjs/common';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SecondFactorRepository } from '../second-factor.repository';
import type { RequestWithSession } from '../session.context';

/**
 * Immediately before a high-risk action, not merely at some point today.
 *
 * `ReauthGuard` proves the caller still controls the OAuth identity, on a
 * fifteen-minute window that suits unlinking a sign-in method. This is the
 * other half the revised specification asks for (§10: 고위험 작업은 실행
 * 직전 다시 인증한다): a TOTP code spent in the last two minutes, which in
 * practice means the operator typed it into the confirmation dialog that
 * named the target, the amount, the blast radius and how to undo it.
 *
 * Two minutes, not the console session's thirty: a step-up that outlives the
 * screen it was asked on is a step-up somebody else can spend.
 */
const SECOND_FACTOR_WINDOW_SECONDS = 120;

@Injectable()
export class SecondFactorGuard implements CanActivate {
  constructor(
    @Inject(SecondFactorRepository) private readonly factors: SecondFactorRepository | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.factors) throw new ServiceUnavailableException('second factor store unavailable');
    const request = context.switchToHttp().getRequest<RequestWithSession>();
    const userId = request.session?.user_id;
    const recent =
      userId !== undefined &&
      userId !== null &&
      (await this.factors.satisfiedRecently(userId, SECOND_FACTOR_WINDOW_SECONDS));
    if (!recent) {
      throw new UnauthorizedException({
        message: 'recent second factor required',
        code: 'second_factor_required',
      });
    }
    return true;
  }
}

export { SECOND_FACTOR_WINDOW_SECONDS };
