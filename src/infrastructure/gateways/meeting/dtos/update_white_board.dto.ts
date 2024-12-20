import { ApiProperty } from '@nestjs/swagger';
import { WhiteBoardAction } from 'src/domain/models/white-board-action';

export enum PaintType {
  normal = 'normal',
  polygon = 'polygon',
  circle = 'circle',
  square = 'square',
  line = 'line',
  eraser = 'eraser',
}

export interface PaintModel {
  color: string;
  offsets: OffsetModel[];
  width: number;
  poligonSides: number;
  isFilled: boolean;
  type: PaintType;
  createdAt: string;
}

export interface OffsetModel {
  dx: number;
  dy: number;
}

export class UpdateWhiteBoardDto {
  @ApiProperty({ type: String })
  roomId: string;

  @ApiProperty({
    type: 'enum',
    enum: WhiteBoardAction,
    default: WhiteBoardAction.add,
  })
  action: string;

  @ApiProperty({ type: 'simple-json' })
  paints: PaintModel[];
}
