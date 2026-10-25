import { Controller, Get, Header, Inject, NotFoundException, Param, ParseUUIDPipe, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';
import { StockService } from './stock.service';

@ApiTags('stocks')
@Controller('stocks')
export class StockDepthController {
  constructor(@Inject(StockService) private readonly stocks: StockService | null) {}

  @Get(':id/depth')
  @SkipInternalToken()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Verified stock depth availability; never simulated liquidity' })
  async depth(@Param('id', ParseUUIDPipe) stockId: string) {
    if (!this.stocks) throw new ServiceUnavailableException('stock service is unavailable');
    // The catalogue is database-backed, but no persisted executable open-order depth exists.
    const stocks = await this.stocks.list();
    if (!stocks.some((stock) => stock.id === stockId)) {
      throw new NotFoundException('stock not found');
    }
    return {
      stockId,
      status: 'UNAVAILABLE' as const,
      source: 'NO_VERIFIED_OPEN_ORDERS' as const,
      bids: [] as readonly never[],
      asks: [] as readonly never[],
    };
  }
}
