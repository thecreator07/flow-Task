import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { MongooseModule } from "@nestjs/mongoose";
import { AiSuggestModule } from "./ai-suggest/ai-suggest.module";
import { TasksController } from "./tasks/tasks.controller";
import { TasksModule } from "./tasks/tasks.module";
import { AuthModule } from "./auth/auth.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI as string, {
      dbName: "todo-fast",
    }),
    UsersModule,
    AuthModule,
    AiSuggestModule,
    TasksModule,
    NotificationsModule,
  ],
  controllers: [TasksController],
})
export class AppModule {}
