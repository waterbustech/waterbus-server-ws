import { ApiProperty } from '@nestjs/swagger';
import * as webrtc from 'werift';

export class SendCandidateDto {
  @ApiProperty({ type: String })
  targetId: string;

  @ApiProperty({ type: String })
  candidate: webrtc.RTCIceCandidate;
}
