import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway, TaskNotification } from './notifications.gateway';
import { Task } from '../tasks/schemas/task.schema';
import { ISessionUser } from '../interfaces/session.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  // Send task assignment notification
  async notifyTaskAssignment(
    task: Task,
    assignedToUserId: string,
    assignedByUser: ISessionUser,
  ) {
    const notification: TaskNotification = {
      type: 'TASK_ASSIGNED',
      taskId: task._id.toString(),
      taskTitle: task.title,
      message: `You have been assigned a new task: "${task.title}" by ${assignedByUser.name}`,
      assignedTo: assignedToUserId,
      assignedBy: assignedByUser.id,
      timestamp: new Date(),
    };

    // Send notification to the assigned user
    this.notificationsGateway.sendNotificationToUser(
      assignedToUserId,
      notification,
    );

    this.logger.log(
      `Task assignment notification sent to user ${assignedToUserId} for task "${task.title}"`,
    );

    return notification;
  }

  // Send task update notification
  async notifyTaskUpdate(
    task: Task,
    updatedByUser: ISessionUser,
    changes: string[],
  ) {
    const notification: TaskNotification = {
      type: 'TASK_UPDATED',
      taskId: task._id.toString(),
      taskTitle: task.title,
      message: `Task "${task.title}" has been updated by ${updatedByUser.name}. Changes: ${changes.join(', ')}`,
      timestamp: new Date(),
    };

    // Notify both assigned user and creator (if different)
    const usersToNotify = new Set<string>();
    
    if (task.assignedTo) {
      const assignedToId = typeof task.assignedTo === 'object' 
        ? (task.assignedTo as any)._id?.toString() || (task.assignedTo as any).toString()
        : (task.assignedTo as any).toString();
      usersToNotify.add(assignedToId);
    }
    
    if (task.createdBy) {
      const createdById = typeof task.createdBy === 'object'
        ? (task.createdBy as any)._id?.toString() || (task.createdBy as any).toString()
        : (task.createdBy as any).toString();
      usersToNotify.add(createdById);
    }

    // Don't notify the user who made the update
    usersToNotify.delete(updatedByUser.id);

    if (usersToNotify.size > 0) {
      this.notificationsGateway.sendNotificationToUsers(
        Array.from(usersToNotify),
        notification,
      );

      this.logger.log(
        `Task update notification sent for task "${task.title}" to ${usersToNotify.size} users`,
      );
    }

    return notification;
  }

  // Send task completion notification
  async notifyTaskCompletion(task: Task, completedByUser: ISessionUser) {
    const notification: TaskNotification = {
      type: 'TASK_COMPLETED',
      taskId: task._id.toString(),
      taskTitle: task.title,
      message: `Task "${task.title}" has been completed by ${completedByUser.name}`,
      timestamp: new Date(),
    };

    // Notify task creator if different from the person who completed it
    if (task.createdBy) {
      const createdById = typeof task.createdBy === 'object'
        ? (task.createdBy as any)._id?.toString() || (task.createdBy as any).toString()
        : (task.createdBy as any).toString();
      
      if (createdById !== completedByUser.id) {
        this.notificationsGateway.sendNotificationToUser(
          createdById,
          notification,
        );

        this.logger.log(
          `Task completion notification sent for task "${task.title}"`,
        );
      }
    }

    return notification;
  }

  // Send task deletion notification
  async notifyTaskDeletion(
    taskTitle: string,
    taskId: string,
    deletedByUser: ISessionUser,
    affectedUserIds: string[],
  ) {
    const notification: TaskNotification = {
      type: 'TASK_DELETED',
      taskId,
      taskTitle,
      message: `Task "${taskTitle}" has been deleted by ${deletedByUser.name}`,
      timestamp: new Date(),
    };

    // Notify affected users (excluding the one who deleted it)
    const usersToNotify = affectedUserIds.filter(id => id !== deletedByUser.id);

    if (usersToNotify.length > 0) {
      this.notificationsGateway.sendNotificationToUsers(
        usersToNotify,
        notification,
      );

      this.logger.log(
        `Task deletion notification sent for task "${taskTitle}" to ${usersToNotify.length} users`,
      );
    }

    return notification;
  }

  // Send task reassignment notification
  async notifyTaskReassignment(
    task: Task,
    newAssigneeId: string,
    previousAssigneeId: string | null,
    reassignedByUser: ISessionUser,
  ) {
    // Notify new assignee
    const assignmentNotification: TaskNotification = {
      type: 'TASK_ASSIGNED',
      taskId: task._id.toString(),
      taskTitle: task.title,
      message: `You have been assigned task: "${task.title}" by ${reassignedByUser.name}`,
      assignedTo: newAssigneeId,
      assignedBy: reassignedByUser.id,
      timestamp: new Date(),
    };

    this.notificationsGateway.sendNotificationToUser(
      newAssigneeId,
      assignmentNotification,
    );

    // Notify previous assignee if exists and different
    if (previousAssigneeId && previousAssigneeId !== newAssigneeId) {
      const unassignmentNotification: TaskNotification = {
        type: 'TASK_UPDATED',
        taskId: task._id.toString(),
        taskTitle: task.title,
        message: `Task "${task.title}" has been reassigned to another user by ${reassignedByUser.name}`,
        timestamp: new Date(),
      };

      this.notificationsGateway.sendNotificationToUser(
        previousAssigneeId,
        unassignmentNotification,
      );
    }

    this.logger.log(
      `Task reassignment notifications sent for task "${task.title}"`,
    );

    return { assignmentNotification };
  }

  // Get notification statistics
  getNotificationStats() {
    return {
      connectedUsers: this.notificationsGateway.getConnectedUsersCount(),
      timestamp: new Date(),
    };
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.notificationsGateway.isUserOnline(userId);
  }
}
