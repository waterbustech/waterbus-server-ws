import { ApiProperty } from '@nestjs/swagger';

export class SetSubscribeSubtitleDto {
  @ApiProperty({ type: Boolean })
  enabled: boolean;
}
