import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [EventsGateway, EventsService, JwtService],
})
export class EventsModule {}
