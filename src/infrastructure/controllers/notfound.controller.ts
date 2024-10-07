// not-found.controller.ts
import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class NotFoundController {
  private readonly logger = new Logger(NotFoundController.name);

  @All('*')
  handleNotFound(@Req() req: Request, @Res() res: Response) {
    this.logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      statusCode: 404,
      message: 'Resource not found',
      path: req.originalUrl,
    });
  }
}
