import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ISessionUser } from '../interfaces/session.interface';

export interface TaskNotification {
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED';
  taskId: string;
  taskTitle: string;
  message: string;
  assignedTo?: string;
  assignedBy?: string;
  timestamp: Date;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId, socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; user: ISessionUser },
  ) {
    const { userId, user } = data;
    
    // Store user connection
    this.connectedUsers.set(userId, client.id);
    
    // Join user-specific room
    client.join(`user:${userId}`);
    
    this.logger.log(`User ${user.name} (${userId}) joined notifications`);
    
    // Send confirmation
    client.emit('joined', {
      message: 'Successfully joined notifications',
      userId,
    });
  }

  @SubscribeMessage('leave')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    
    // Remove from connected users
    this.connectedUsers.delete(userId);
    
    // Leave user-specific room
    client.leave(`user:${userId}`);
    
    this.logger.log(`User ${userId} left notifications`);
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: TaskNotification) {
    const room = `user:${userId}`;
    this.server.to(room).emit('taskNotification', notification);
    
    this.logger.log(
      `Sent notification to user ${userId}: ${notification.message}`,
    );
  }

  // Method to send notification to multiple users
  sendNotificationToUsers(userIds: string[], notification: TaskNotification) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  // Method to broadcast notification to all connected users
  broadcastNotification(notification: TaskNotification) {
    this.server.emit('taskNotification', notification);
    this.logger.log(`Broadcasted notification: ${notification.message}`);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
