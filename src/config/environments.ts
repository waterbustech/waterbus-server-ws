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

  getPodName(): string {
    return this.configService.get<string>('HOSTNAME');
  }
}
