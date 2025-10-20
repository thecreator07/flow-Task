import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import session from "express-session";
import { getSessionConfig } from "./config/session.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{logger:['error','warn','log']});
 
  

  const configService = app.get(ConfigService);

  // Configure session middleware
  app.use(session(getSessionConfig(configService)));

  app.use(cookieParser());
  
  // Configure CORS origins based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const corsOrigins = isProduction
    ? (process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['https://your-frontend-domain.run.app']) // Replace with actual frontend URL
    : ['http://localhost:3000'];
    
  console.log('CORS Origins:', corsOrigins);
  console.log('Environment:', process.env.NODE_ENV);
    
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
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