import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthCheckController {
  @Get()
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
