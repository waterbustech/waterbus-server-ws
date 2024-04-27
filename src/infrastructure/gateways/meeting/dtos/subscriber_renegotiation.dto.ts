import { ApiProperty } from '@nestjs/swagger';

export class SubscriberRenegotiationDto {
  @ApiProperty({ type: String })
  sdp: string;

  @ApiProperty({ type: String })
  targetId: string;
}
