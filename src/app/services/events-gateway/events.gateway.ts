import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import AppConfig from '@/config/app-config';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: '*:*' })
export class EventsGateway {
  @WebSocketServer()
    server: Server;

  private client: Socket;

  constructor(private readonly jwtService: JwtService) {}

  @OnEvent('connection')
  async handleConnection(client: Socket) {
    this.client = client;
    console.log(`Client connected: ${client.id}`);
    try {
      const token = client?.handshake?.auth?.token?.split(' ')[1] || '';
      await this.jwtService.verify(token, {
        algorithms: ['RS256'],
        publicKey: AppConfig.jwt.publicKey,
      });
    } catch (e) {
      console.log(e.message);
      //throw new UnauthorizedException('Invalid token');
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: any) {
    try {
      const roomName = `room:${data.roomId}`;
      this.client.join(roomName);
      console.log(`Client joined room: ${roomName}`);
    } catch (e) {
      console.log(e.message);
      //throw new UnauthorizedException('Invalid token');
    }
  }
}
