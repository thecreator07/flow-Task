import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { TaskStatus } from "../enums/enum";
import { PartialType } from "@nestjs/mapped-types";
import { TaskCreateDto } from "./task-create.dto";

export class UpdateTaskDto extends PartialType(TaskCreateDto) {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
