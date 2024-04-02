import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private logger = new Logger(CacheInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isCached = true;
    
    if (isCached) {
      this.logger.log('Getting data from cache');

      return of([]);
    }
    
    this.logger.log('Getting data from database');
    
    return next.handle();
  }
}
