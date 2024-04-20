import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ type: String })
  targetId: string;

  @ApiProperty({ type: String })
  roomId: string;

  @ApiProperty({ type: String })
  participantId: string;
}
