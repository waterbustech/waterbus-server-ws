import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  getPort(): number {
    return Number(this.configService.get<number>('PORT'));
  }

  getRedisUrl(): string {
    return this.configService.get<string>('REDIS_URL');
  }

  getMeetingGrpcUrl(): string {
    return this.configService.get<string>('MEETING_GRPC_ADDRESS');
  }

  getPodName(): string {
    return this.configService.get<string>('HOSTNAME');
  }
}
