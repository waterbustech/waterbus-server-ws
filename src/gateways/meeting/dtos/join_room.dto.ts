import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiProperty({ type: String })
  sdp: string;

  @ApiProperty({ type: String })
  roomId: string;

  @ApiProperty({ type: String })
  participantId: string;

  @ApiProperty({ type: Boolean })
  isVideoEnabled: boolean;

  @ApiProperty({ type: Boolean })
  isAudioEnabled: boolean;

  @ApiProperty({ type: Boolean })
  isE2eeEnabled: boolean;
}
