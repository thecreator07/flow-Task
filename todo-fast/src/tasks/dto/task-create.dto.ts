import {
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
  MinLength,
} from "class-validator";
import { TaskPriority, TaskStatus } from "../enums/enum";

export class TaskCreateDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  assignedTo?: string;
}
