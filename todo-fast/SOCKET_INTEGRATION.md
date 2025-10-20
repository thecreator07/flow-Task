# Socket.IO Real-Time Notifications Integration

## Overview
This document describes the Socket.IO integration for real-time task notifications in the NestJS backend.

## Required Dependencies

To complete the Socket.IO integration, install the following dependencies:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

## Features Implemented

### 1. Real-Time Notifications
- **Task Assignment**: Users receive instant notifications when assigned to tasks
- **Task Updates**: Notifications for task status, priority, and content changes
- **Task Completion**: Notifications when tasks are marked as completed
- **Task Reassignment**: Notifications for task reassignments
- **Task Deletion**: Notifications when tasks are deleted

### 2. WebSocket Gateway (`notifications.gateway.ts`)
- Handles WebSocket connections and disconnections
- Manages user rooms for targeted notifications
- Provides methods for broadcasting notifications
- Tracks online users

### 3. Notification Service (`notifications.service.ts`)
- Business logic for different notification types
- Handles user targeting and message formatting
- Integrates with the WebSocket gateway

### 4. Integration Points
- **TasksService**: Enhanced with notification calls
- **TasksController**: Passes user context for notifications
- **TasksModule**: Imports NotificationsModule
- **AppModule**: Includes NotificationsModule

## Socket.IO Events

### Client Events (Frontend → Backend)
```javascript
// Join user-specific notification room
socket.emit('join', {
  userId: 'user123',
  user: { id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'USER' }
});

// Leave notification room
socket.emit('leave', { userId: 'user123' });
```

### Server Events (Backend → Frontend)
```javascript
// Task notification received
socket.on('taskNotification', (notification) => {
  console.log('Received notification:', notification);
  // notification structure:
  // {
  //   type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED',
  //   taskId: 'task123',
  //   taskTitle: 'Task Title',
  //   message: 'Notification message',
  //   assignedTo?: 'user123',
  //   assignedBy?: 'manager456',
  //   timestamp: '2023-10-18T14:30:00.000Z'
  // }
});

// Join confirmation
socket.on('joined', (data) => {
  console.log('Successfully joined notifications:', data);
});
```

## Notification Types

### 1. Task Assignment
- **Trigger**: When a task is created with an assignee or reassigned
- **Recipients**: Newly assigned user
- **Message**: "You have been assigned a new task: '{taskTitle}' by {assignerName}"

### 2. Task Update
- **Trigger**: When task properties are modified
- **Recipients**: Assigned user and task creator (excluding the updater)
- **Message**: "Task '{taskTitle}' has been updated by {updaterName}. Changes: {changesList}"

### 3. Task Completion
- **Trigger**: When task status changes to COMPLETED
- **Recipients**: Task creator (if different from completer)
- **Message**: "Task '{taskTitle}' has been completed by {completerName}"

### 4. Task Reassignment
- **Trigger**: When task is reassigned to a different user
- **Recipients**: New assignee and previous assignee
- **Messages**: 
  - New assignee: "You have been assigned task: '{taskTitle}' by {reassignerName}"
  - Previous assignee: "Task '{taskTitle}' has been reassigned to another user by {reassignerName}"

### 5. Task Deletion
- **Trigger**: When a task is deleted
- **Recipients**: All affected users (assignee, creator)
- **Message**: "Task '{taskTitle}' has been deleted by {deleterName}"

## Connection Management

### User Rooms
- Each user joins a room: `user:{userId}`
- Allows targeted notifications to specific users
- Automatic cleanup on disconnect

### Online Status
- Tracks connected users in memory
- Provides `isUserOnline(userId)` method
- Real-time connection count available

## Security Considerations

### CORS Configuration
```javascript
cors: {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}
```

### Authentication
- Uses session-based authentication
- User context passed through session data
- Role-based notification filtering

## Usage in Controllers

The integration automatically sends notifications when:
- Tasks are created with assignees
- Tasks are updated by users
- Tasks are reassigned
- Tasks are completed
- Tasks are deleted

Example controller usage:
```typescript
// Task creation with notification
return this.tasksService.create(taskData, user);

// Task update with notification
return this.tasksService.updateTask(id, updateTaskDto, user);

// Task reassignment with notification
return this.tasksService.assignTask(id, assignedTo, user);
```

## Frontend Integration

See the `client-example.html` file for a complete frontend integration example using Socket.IO client library.

## Testing

1. Start the NestJS server
2. Connect multiple clients with different user IDs
3. Perform task operations (create, update, assign, complete, delete)
4. Verify notifications are received by appropriate users
5. Check browser console for notification logs

## Troubleshooting

### Common Issues
1. **Module not found errors**: Install required Socket.IO dependencies
2. **CORS errors**: Ensure frontend origin is configured in CORS settings
3. **Connection failures**: Check WebSocket port and firewall settings
4. **Missing notifications**: Verify user is properly joined to notification room

### Debug Mode
Enable detailed logging by setting log level to 'debug' in the NestJS application.
