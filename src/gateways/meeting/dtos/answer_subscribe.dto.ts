import { ApiProperty } from '@nestjs/swagger';

export class AnswerSubscribeDto {
  @ApiProperty({ type: String })
  targetId: string;

  @ApiProperty({ type: String })
  sdp: string;
}
