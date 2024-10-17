import { ApiProperty } from '@nestjs/swagger';

export class SetHandRaisingDto {
  @ApiProperty({ type: Boolean })
  isRaising: boolean;
}
