import { ApiProperty } from '@nestjs/swagger';

export class SetHardwareStatusDto {
  @ApiProperty({ type: Boolean })
  isEnabled: boolean;
}
