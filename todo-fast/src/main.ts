import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import session from "express-session";
import { getSessionConfig } from "./config/session.config";
import { ExpressAdapter } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule,{logger:['error','warn','log']});
 
  // ✅ Access underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance()
  expressApp.set('trust proxy', 1); // <-- this works inside NestJS!

  const configService = app.get(ConfigService);
  
  app.use(cookieParser());
  
  // Configure session middleware
  app.use(session(getSessionConfig(configService)));
  
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];
    
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

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