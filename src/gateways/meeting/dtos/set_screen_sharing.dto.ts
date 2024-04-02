import { ApiProperty } from '@nestjs/swagger';

export class SetScreenSharingDto {
  @ApiProperty({ type: Boolean })
  isSharing: boolean;
}
