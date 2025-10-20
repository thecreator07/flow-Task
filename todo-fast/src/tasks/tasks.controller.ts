import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { TasksService, TaskStats } from "./tasks.service";
import { SessionAuthGuard } from "../auth/guards/session-auth.guard";
import { SessionRolesGuard } from "../auth/guards/session-roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/enums/role.enum";
import { Session } from "../auth/decorators/session.decorator";
import type { ISessionUser } from "src/interfaces";
import { TaskCreateDto } from "./dto/task-create.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskPriority, TaskStatus } from "./enums/enum";

// TaskFilters interface for query parameters
interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  createdBy?: string;
  assignedTo?: string;
}

@Controller("tasks")
@UseGuards(SessionAuthGuard, SessionRolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  // Create a new task
  // Only MANAGER or ADMIN can create
  @Post()
  @Roles(Role.MANAGER, Role.ADMIN)
  async createTask(
    @Body() createTaskDto: TaskCreateDto,
    @Session() user: ISessionUser,
  ) {
    const taskData = {
      ...createTaskDto,
      createdBy: user.id,
    };
    return this.tasksService.create(taskData, user);
  }

  // Get all tasks 
  // Users see only assigned/created tasks, Managers/Admins see all
  @Get()
  async findAll(@Query() filters: TaskFilters, @Session() user: ISessionUser) {
    return this.tasksService.findAllWithRoleFilter(filters, user);
  }

  //  Get task statistics
  @Get("stats")
  async getStats(@Session() user: ISessionUser): Promise<TaskStats> {
    return this.tasksService.getTaskStats(user);
  }

  @Get("user")
  @Roles(Role.MANAGER, Role.ADMIN)
  async getAllUsersWithTasks() {
    return this.tasksService.getAllUsersWithTasks();
  }


  //  Get tasks by user 
  @Get("user/:userId")
  @Roles(Role.MANAGER, Role.ADMIN)
  async getTasksByUser(@Param("userId") userId: string) {
    return this.tasksService.findTasksByUser(userId);
  }


  // Get current user's tasks
  @Get("my-tasks")
  async getMyTasks(@Session() user: ISessionUser) {
    return this.tasksService.findMyTasks(user.id);
  }

  // Get single task
  @Get(":id")
  async findOne(@Param("id") id: string, @Session() user: ISessionUser) {
    const task = await this.tasksService.findOne(id);
    console.log(task);
    // Check access permissions
    if (user.role === Role.USER) {
      const hasAccess =
        task.assignedTo._id.toString() === user.id ||
        task.createdBy._id.toString() === user.id;
      if (!hasAccess) {
        throw new NotFoundException("Task not found or access denied");
      }
    }

    return task;
  }



  @Patch(":id")
  async updateTask(
    @Param("id") id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Session() user: ISessionUser,
  ) {
    const task = await this.tasksService.findOne(id);

    // Check permissions
    if (user.role === Role.USER) {
      const assignedToId =
        typeof task.assignedTo === "object" && task.assignedTo._id
          ? task.assignedTo._id.toString()
          : task.assignedTo.toString();
      const createdById =
        typeof task.createdBy === "object" && task.createdBy._id
          ? task.createdBy._id.toString()
          : task.createdBy.toString();

      const hasAccess = assignedToId === user.id || createdById === user.id;
      if (!hasAccess) {
        throw new NotFoundException("Task not found or access denied");
      }

      // Users can only update status and limited fields
      const allowedFields = ["status"];
      const filteredDto = Object.keys(updateTaskDto)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj: Record<string, any>, key) => {
          obj[key] = updateTaskDto[key as keyof UpdateTaskDto];
          return obj;
        }, {});

      return this.tasksService.updateTask(id, filteredDto, user);
    }

    // Managers and Admins have full update access
    return this.tasksService.updateTask(id, updateTaskDto, user);
  }

  // Reassign task (Manager/Admin only)
  @Patch(":id/assign")
  @Roles(Role.MANAGER, Role.ADMIN)
  async reassignTask(
    @Param("id") id: string,
    @Body("assignedTo") assignedTo: string,
    @Session() user: ISessionUser,
  ) {
    return this.tasksService.assignTask(id, assignedTo, user);
  }

  // Delete a task
  @Delete(":id")
  async deleteTask(@Param("id") id: string, @Session() user: ISessionUser) {
    const task = await this.tasksService.findOne(id);

    // Check permissions
    if (user.role === Role.USER) {
      // Users can only delete tasks they created
      if (task.createdBy._id.toString() !== user.id) {
        throw new NotFoundException("Task not found or access denied");
      }
    }

    return this.tasksService.deleteTask(id);
  }

  // Bulk delete tasks (Manager/Admin only)
  @Delete("bulk/:ids")
  @Roles(Role.MANAGER, Role.ADMIN)
  async bulkDeleteTasks(@Param("ids") ids: string) {
    const taskIds = ids.split(",");
    return this.tasksService.bulkDelete(taskIds);
  }
}
