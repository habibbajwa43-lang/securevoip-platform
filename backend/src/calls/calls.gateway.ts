import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CallsService } from './calls.service';

interface AuthSocket extends Socket {
  user?: User;
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/calls',
  transports: ['websocket', 'polling'],
})
export class CallsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CallsGateway.name);
  private readonly connectedUsers = new Map<string, string>(); // userId -> socketId
  private readonly activeCalls = new Map<string, any>(); // callId -> call info

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly callsService: CallsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  afterInit(server: Server) {
    this.logger.log('📞 VoIP WebSocket Gateway initialized');
  }

  async handleConnection(socket: AuthSocket) {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        socket.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'firstName', 'lastName', 'email', 'status', 'dndEnabled'],
      });

      if (!user) {
        socket.disconnect(true);
        return;
      }

      socket.user = user;
      socket.userId = user.id;
      socket.join(`user:${user.id}`);

      // Track connected user
      this.connectedUsers.set(user.id, socket.id);

      // Notify user is online
      socket.broadcast.emit('user:online', { userId: user.id });

      this.logger.log(`✅ User connected: ${user.email} (${socket.id})`);
      socket.emit('connection:success', { userId: user.id, socketId: socket.id });
    } catch (error) {
      this.logger.warn(`❌ WebSocket auth failed: ${error.message}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: AuthSocket) {
    if (socket.userId) {
      this.connectedUsers.delete(socket.userId);
      socket.broadcast.emit('user:offline', { userId: socket.userId });

      // Handle any active calls
      this.handleDisconnectedActiveCalls(socket.userId);

      this.logger.log(`👋 User disconnected: ${socket.userId}`);
    }
  }

  // ─── SIP/WebRTC Signaling ─────────────────────────────────────────────────

  @SubscribeMessage('call:initiate')
  async handleCallInitiate(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: {
      toNumber: string;
      fromNumber: string;
      callType: 'voice' | 'video';
      sdpOffer?: string;
    },
  ) {
    try {
      const call = await this.callsService.initiateCall({
        userId: socket.userId,
        fromNumber: data.fromNumber,
        toNumber: data.toNumber,
        callType: data.callType,
      });

      this.activeCalls.set(call.id, {
        ...call,
        callerSocketId: socket.id,
        sdpOffer: data.sdpOffer,
      });

      socket.emit('call:initiated', {
        callId: call.id,
        status: 'ringing',
        toNumber: data.toNumber,
      });

      // Emit ringing to any internal user
      const targetSocketId = this.connectedUsers.get(call.targetUserId);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('call:incoming', {
          callId: call.id,
          fromNumber: data.fromNumber,
          callerName: socket.user?.firstName + ' ' + socket.user?.lastName,
          callType: data.callType,
          sdpOffer: data.sdpOffer,
        });
      }

      this.logger.log(`📞 Call initiated: ${call.id}`);
      return { success: true, callId: call.id };
    } catch (error) {
      socket.emit('call:error', { message: error.message });
    }
  }

  @SubscribeMessage('call:answer')
  async handleCallAnswer(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string; sdpAnswer: string },
  ) {
    const call = this.activeCalls.get(data.callId);
    if (!call) {
      socket.emit('call:error', { message: 'Call not found' });
      return;
    }

    // Forward SDP answer to caller
    this.server.to(call.callerSocketId).emit('call:answered', {
      callId: data.callId,
      sdpAnswer: data.sdpAnswer,
    });

    // Update call status
    await this.callsService.updateCallStatus(data.callId, 'in_progress');
    this.activeCalls.set(data.callId, { ...call, status: 'in_progress', answeredAt: new Date() });

    this.logger.log(`✅ Call answered: ${data.callId}`);
  }

  @SubscribeMessage('call:reject')
  async handleCallReject(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string; reason?: string },
  ) {
    const call = this.activeCalls.get(data.callId);
    if (call) {
      this.server.to(call.callerSocketId).emit('call:rejected', {
        callId: data.callId,
        reason: data.reason || 'User rejected',
      });
      await this.callsService.updateCallStatus(data.callId, 'rejected');
      this.activeCalls.delete(data.callId);
    }
  }

  @SubscribeMessage('call:end')
  async handleCallEnd(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string },
  ) {
    const call = this.activeCalls.get(data.callId);
    if (call) {
      // Notify all parties
      this.server.to(`call:${data.callId}`).emit('call:ended', {
        callId: data.callId,
        duration: call.answeredAt
          ? Math.floor((Date.now() - call.answeredAt.getTime()) / 1000)
          : 0,
      });

      await this.callsService.endCall(data.callId, socket.userId);
      this.activeCalls.delete(data.callId);

      this.logger.log(`📵 Call ended: ${data.callId}`);
    }
  }

  // ─── WebRTC ICE Candidates ─────────────────────────────────────────────────

  @SubscribeMessage('webrtc:ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string; candidate: RTCIceCandidateInit },
  ) {
    const call = this.activeCalls.get(data.callId);
    if (!call) return;

    // Forward ICE candidate to the other party
    const targetSocketId =
      socket.id === call.callerSocketId
        ? call.answererSocketId
        : call.callerSocketId;

    if (targetSocketId) {
      this.server.to(targetSocketId).emit('webrtc:ice-candidate', {
        callId: data.callId,
        candidate: data.candidate,
      });
    }
  }

  // ─── Call Controls ─────────────────────────────────────────────────────────

  @SubscribeMessage('call:mute')
  handleMute(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string; muted: boolean },
  ) {
    this.server.to(`call:${data.callId}`).emit('call:mute-changed', {
      userId: socket.userId,
      muted: data.muted,
    });
  }

  @SubscribeMessage('call:hold')
  async handleHold(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string; onHold: boolean },
  ) {
    this.server.to(`call:${data.callId}`).emit('call:hold-changed', {
      userId: socket.userId,
      onHold: data.onHold,
    });
    await this.callsService.updateCallHoldStatus(data.callId, data.onHold);
  }

  @SubscribeMessage('call:transfer')
  async handleTransfer(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string; toNumber: string },
  ) {
    try {
      await this.callsService.transferCall(data.callId, data.toNumber, socket.userId);
      socket.emit('call:transfer-initiated', { callId: data.callId, toNumber: data.toNumber });
    } catch (error) {
      socket.emit('call:error', { message: error.message });
    }
  }

  @SubscribeMessage('call:dtmf')
  handleDtmf(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { callId: string; digit: string },
  ) {
    this.callsService.sendDtmf(data.callId, data.digit, socket.userId);
  }

  // ─── Presence & Status ─────────────────────────────────────────────────────

  @SubscribeMessage('presence:update')
  handlePresenceUpdate(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { status: 'available' | 'busy' | 'away' | 'dnd' },
  ) {
    socket.broadcast.emit('presence:changed', {
      userId: socket.userId,
      status: data.status,
    });
  }

  @SubscribeMessage('presence:get-online-users')
  handleGetOnlineUsers(@ConnectedSocket() socket: AuthSocket) {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    socket.emit('presence:online-users', { users: onlineUsers });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  private async handleDisconnectedActiveCalls(userId: string) {
    for (const [callId, call] of this.activeCalls.entries()) {
      if (call.userId === userId && call.status === 'in_progress') {
        this.server.to(`call:${callId}`).emit('call:ended', {
          callId,
          reason: 'User disconnected',
        });
        await this.callsService.endCall(callId, userId);
        this.activeCalls.delete(callId);
      }
    }
  }
}
