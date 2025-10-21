// src/config/session.config.ts

import { ConfigService } from "@nestjs/config";
import * as session from "express-session";
import MongoStore from "connect-mongo";

export const getSessionConfig = (
  configService: ConfigService,
): session.SessionOptions => {
  const isProduction = configService.get("NODE_ENV") === "production";
  const isHttps = configService.get("HTTPS") === "true" || isProduction;
  
  console.log("Session config - Production:", isProduction, "HTTPS:", isHttps);
  
  return {
    secret:
      configService.get<string>("SESSION_SECRET") ||
      "default-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: configService.get<string>("MONGODB_URI"),
      dbName: "todo-fast",
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      secure: isHttps,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.flow-task-285212977651.asia-south2.run.app' : undefined,
    },
    name: "sessionId",
  };
};