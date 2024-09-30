import { ApiProperty } from '@nestjs/swagger';

export class CleanWhiteBoardDto {
  @ApiProperty({ type: String })
  roomId: string;
}
