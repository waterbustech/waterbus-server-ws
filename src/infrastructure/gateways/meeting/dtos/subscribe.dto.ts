import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ type: String })
  targetId: string;
}
