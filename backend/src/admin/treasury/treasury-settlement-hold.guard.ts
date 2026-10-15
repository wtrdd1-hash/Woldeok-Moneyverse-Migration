import { Injectable, ServiceUnavailableException, type CanActivate } from '@nestjs/common';

/** Block all legacy financial writes until they use independently verified canonical accounting. */
@Injectable()
export class TreasurySettlementHoldGuard implements CanActivate {
  canActivate(): never {
    throw new ServiceUnavailableException(
      '국고 원장·준비금·자금 출처 검증 전까지 이 재정 집행은 중단되어 있습니다.',
    );
  }
}
