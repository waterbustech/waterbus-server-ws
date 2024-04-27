import { ApiProperty } from '@nestjs/swagger';

export class PublisherRenegotiationDto {
  @ApiProperty({ type: String })
  sdp: string;
}
