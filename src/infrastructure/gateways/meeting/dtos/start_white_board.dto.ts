import { ApiProperty } from '@nestjs/swagger';

export class StartWhiteBoardDto {
  @ApiProperty({ type: String })
  roomId: string;
}
