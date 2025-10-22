import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Task, TaskDocument } from "./schemas/task.schema";
import { Model, FilterQuery, Types } from "mongoose";
import { TaskCreateDto } from "./dto/task-create.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { Role } from "../auth/enums/role.enum";
import { ISessionUser } from "src/interfaces";
import { TaskPriority, TaskStatus } from "./enums/enum";
import { NotificationsService } from "../notifications/notifications.service";
import { User, UserDocument } from "src/users/schemas/user.schema";

// Define interfaces for better type safety
interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string | Types.ObjectId;
  assignedTo?: string | Types.ObjectId;
}

interface TaskQuery extends FilterQuery<TaskDocument> {
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string | Types.ObjectId;
  assignedTo?: string | Types.ObjectId;
  $or?: Array<{
    assignedTo?: string | Types.ObjectId;
    createdBy?: string | Types.ObjectId;
  }>;
}

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
}

interface AggregationResult {
  _id: TaskStatus;
  count: number;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private readonly notificationsService: NotificationsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async create(createTaskDto: TaskCreateDto, createdByUser?: ISessionUser): Promise<Task> {
    const task = new this.taskModel(createTaskDto);
    const savedTask = await task.save();

    // Populate the task to get user details for notification
    const populatedTask = await this.taskModel
      .findById(savedTask._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .exec();

    // Send notification to assigned user if different from creator
    if (populatedTask && createdByUser && populatedTask.assignedTo) {
      const assignedToId = typeof populatedTask.assignedTo === 'object'
        ? (populatedTask.assignedTo as any)._id?.toString() || (populatedTask.assignedTo as any).toString()
        : (populatedTask.assignedTo as any).toString();

      if (assignedToId !== createdByUser.id) {
        await this.notificationsService.notifyTaskAssignment(
          populatedTask,
          assignedToId,
          createdByUser,
        );
      }
    }

    return savedTask;
  }

  // Get all tasks
  async findAll(filters?: TaskFilters): Promise<Task[]> {
    const query: TaskQuery = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.createdBy) query.createdBy = filters.createdBy;
    if (filters?.assignedTo) query.assignedTo = filters.assignedTo;
    return this.taskModel
      .find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 })
      .exec();
  }

  // Get a single task by ID
  async findOne(id: string): Promise<Task> {
    const task = await this.taskModel
      .findById(id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .exec();
    if (!task) throw new NotFoundException("Task not found");
    return task;
  }

  // Update a task
  async update(id: string, updateTaskDto: UpdateTaskDto, updatedByUser?: ISessionUser): Promise<Task> {
    // Get the original task for comparison
    const originalTask = await this.taskModel.findById(id).exec();
    if (!originalTask) throw new NotFoundException("Task not found");

    const updated = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, {
      new: true,
    }).populate("assignedTo", "name email").populate("createdBy", "name email");

    if (!updated) throw new NotFoundException("Task not found");

    // Send notifications if user is provided
    if (updatedByUser) {
      // Determine what changed
      const changes: string[] = [];
      if (originalTask.status !== updated.status) changes.push('status');
      if (originalTask.priority !== updated.priority) changes.push('priority');
      if (originalTask.title !== updated.title) changes.push('title');
      if (originalTask.description !== updated.description) changes.push('description');
      if (originalTask.dueDate?.getTime() !== updated.dueDate?.getTime()) changes.push('due date');

      if (changes.length > 0) {
        await this.notificationsService.notifyTaskUpdate(updated, updatedByUser, changes);
      }

      // Check for task completion
      if (originalTask.status !== TaskStatus.COMPLETED && updated.status === TaskStatus.COMPLETED) {
        await this.notificationsService.notifyTaskCompletion(updated, updatedByUser);
      }
    }

    return updated;
  }

  // Delete a task
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.taskModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException("Task not found");
    return { message: "Task deleted successfully" };
  }

  // Update a task 
  async updateTask(id: string, updateTaskDto: UpdateTaskDto, updatedByUser?: ISessionUser): Promise<Task> {
    return this.update(id, updateTaskDto, updatedByUser);
  }

  // Delete a task
  async deleteTask(id: string): Promise<{ message: string }> {
    return this.remove(id);
  }

  // Get tasks with role-based filtering
  async findAllWithRoleFilter(
    filters: TaskFilters,
    user: ISessionUser,
  ): Promise<Task[]> {
    const query: TaskQuery = {};

    // Apply filters
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.createdBy) query.createdBy = filters.createdBy;
    if (filters?.assignedTo) query.assignedTo = filters.assignedTo;

    // Apply role-based filtering
    if (user.role === Role.USER) {
      // Users can only see tasks assigned to them or created by them
      query.$or = [{ assignedTo: user.id }, { createdBy: user.id }];
    }
    // MANAGER and ADMIN can see all tasks
    console.log("Query:", query);
    const tasks = await this.taskModel
      .find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 })
      .exec();
    console.log("Tasks found:", tasks);
    return tasks;
  }

  // Get task statistics with role-based filtering
  async getTaskStats(user: ISessionUser): Promise<TaskStats> {
    const query: TaskQuery = {};

    // Apply role-based filtering for stats
    if (user.role === Role.USER) {
      query.$or = [{ assignedTo: user.id }, { createdBy: user.id }];
    }

    const stats = await this.taskModel.aggregate<AggregationResult>([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    console.log("stats",stats)
    const total = await this.taskModel.countDocuments(query);
console.log('total doc',total)
    return {
      total,
      byStatus: stats.reduce(
        (acc: Record<string, number>, stat: AggregationResult) => {
          acc[stat._id] = stat.count;
          return acc;
        },
        {},
      ),
    };
  }

  // Get tasks for a specific user (Manager/Admin only)
  async findTasksByUser(userId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        $or: [{ assignedTo: userId }, { createdBy: userId }],
      })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 })
      .exec();
  }

  // Get current user's tasks
  async findMyTasks(userId: string): Promise<Task[]> {
    return this.taskModel
      .find({
        $or: [{ assignedTo: userId }, { createdBy: userId }],
      })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ dueDate: 1 })
      .exec();
  }

  // Assign task to user (Manager/Admin only)
  async assignTask(id: string, assignedTo: string, assignedByUser?: ISessionUser): Promise<Task> {
    // Get the original task to check previous assignee
    const originalTask = await this.taskModel.findById(id).exec();
    if (!originalTask) throw new NotFoundException("Task not found");

    const previousAssigneeId = originalTask.assignedTo ?
      (originalTask.assignedTo as any).toString() : null;

    const updated = await this.taskModel
      .findByIdAndUpdate(id, { assignedTo }, { new: true })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!updated) throw new NotFoundException("Task not found");

    // Send reassignment notifications if user is provided
    if (assignedByUser) {
      await this.notificationsService.notifyTaskReassignment(
        updated,
        assignedTo,
        previousAssigneeId,
        assignedByUser,
      );
    }

    return updated;
  }

  // Bulk delete tasks (Manager/Admin only)
  async bulkDelete(
    ids: string[],
  ): Promise<{ message: string; deletedCount: number }> {
    const result = await this.taskModel.deleteMany({ _id: { $in: ids } });
    return {
      message: `${result.deletedCount} tasks deleted successfully`,
      deletedCount: result.deletedCount,
    };
  }


  getAllUsersWithTasks(): Promise<Array<{ userId: string; tasks: Task[] }>> {
    return this.userModel.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "assignedTo",
          as: "tasks",
        },
      },
      {
        $project: {
          userId: "$_id",
          tasks: 1,
        },
      },
    ]);
  }
}