import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import session from "express-session";
import { getSessionConfig } from "./config/session.config";
async function bootstrap() {
  const app = await NestFactory.create(AppModule,{logger:['error','warn','log']});

  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000','https://flow-task-flame.vercel.app','https://flow-task-285212977651.asia-south2.run.app'];
  console.log(corsOrigins)
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  const expressApp = app.getHttpAdapter().getInstance()
  expressApp.set('trust proxy', 1); 

  const configService = app.get(ConfigService);

  app.use(cookieParser());
  
  app.use(session(getSessionConfig(configService)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port as number);
  
  console.log(`Backend running on port ${port}`);
}
void bootstrap();