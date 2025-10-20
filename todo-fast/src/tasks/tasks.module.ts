import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { MongooseModule } from "@nestjs/mongoose/dist/mongoose.module";
import { Task, TaskSchema } from "./schemas/task.schema";
import { TasksController } from "./tasks.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
