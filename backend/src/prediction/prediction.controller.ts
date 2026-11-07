import { Controller, Get, Header, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/** No market read or order may imply a real WLD transaction without a ledger-backed receipt. */
@ApiTags('predictions')
@Controller('predictions')
export class PredictionController {
  @Get('markets')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex, nofollow')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ summary: 'Prediction markets unavailable pending source verification' })
  markets(): never {
    throw new ServiceUnavailableException({
      code: 'PREDICTION_MARKET_UNVERIFIED',
      message: 'Verified prediction market records are not available',
    });
  }

  @Post('orders')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex, nofollow')
  @Header('Referrer-Policy', 'no-referrer')
  @ApiOperation({ summary: 'Prediction orders disabled pending ledger settlement verification' })
  order(): never {
    throw new ServiceUnavailableException({
      code: 'PREDICTION_SETTLEMENT_UNAVAILABLE',
      message: 'Prediction orders are disabled until ledger settlement receipts are verified',
    });
  }
}
