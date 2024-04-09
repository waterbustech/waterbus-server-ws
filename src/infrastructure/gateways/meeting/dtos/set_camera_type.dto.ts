import { ApiProperty } from '@nestjs/swagger';

export class SentCameraTypeDto {
  @ApiProperty({ type: Number })
  type: number;
}
