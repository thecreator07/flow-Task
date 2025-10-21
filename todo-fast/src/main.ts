import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import session from "express-session";
import { getSessionConfig } from "./config/session.config";

async function bootstrap() {
  // Create app
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  const expressApp = app.getHttpAdapter().getInstance();
  
  // Get services
  const configService = app.get(ConfigService);
  
  // Set trust proxy for sessions
  expressApp.set('trust proxy', 1);
  
  // Configure middleware
  app.use(cookieParser());
  app.use(session(getSessionConfig(configService)));
  
  // Configure CORS
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];
  
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  
  // Configure global pipes
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