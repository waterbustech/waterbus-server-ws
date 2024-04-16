import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webrtc from 'werift';

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  getPort(): number {
    return Number(this.configService.get<number>('PORT'));
  }

  getRedisUrl(): string {
    return this.configService.get<string>('REDIS_URL');
  }

  getRealtimeGrpcUrl(): string {
    return this.configService.get<string>('WEBSOCKET_GRPC_ADDRESS');
  }

  getAuthGrpcUrl(): string {
    return this.configService.get<string>('AUTH_GRPC_ADDRESS');
  }

  getMeetingGrpcUrl(): string {
    return this.configService.get<string>('MEETING_GRPC_ADDRESS');
  }

  getTurnUsername(): string {
    return this.configService.get<string>('TURN_USERNAME');
  }

  getTurnCredential(): string {
    return this.configService.get<string>('TURN_CREDENTIAL');
  }

  getIceServers(): webrtc.RTCIceServer[] {
    return [
      {
        urls: 'stun:turn.waterbus.tech:3478',
        username: this.getTurnUsername(),
        credential: this.getTurnCredential(),
      },
      {
        urls: 'turn:turn.waterbus.tech:3478?transport=udp',
        username: this.getTurnUsername(),
        credential: this.getTurnCredential(),
      },
    ];
  }

  isUsePm2(): boolean {
    return this.configService.get<boolean>('IS_USE_PM2') || false;
  }

  getPodName(): string {
    return this.configService.get<string>(
      this.isUsePm2() ? 'pm_id' : 'HOSTNAME',
    );
  }
}
