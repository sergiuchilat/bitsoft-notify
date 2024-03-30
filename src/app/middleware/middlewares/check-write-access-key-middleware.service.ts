import { Injectable, NestMiddleware, UnauthorizedException/*, UnauthorizedException */ } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import AppConfig from '@/config/app-config';

@Injectable()
export class CheckWriteAccessKeyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const key = req?.headers['x-api-key'];
    console.log('req', req.headers);
    console.log('key', key);
    console.log('AppConfig.app.security.write_access_key', AppConfig.app.security.write_access_key);

    if (!key?.length || key !== AppConfig.app.security.write_access_key) {
      throw new UnauthorizedException({
        error_code: 'INVALID_ACCESS_KEY',
      });
    }

    next();
  }
}
