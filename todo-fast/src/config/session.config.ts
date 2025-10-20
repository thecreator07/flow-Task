// src/config/session.config.ts

import { ConfigService } from "@nestjs/config";
import * as session from "express-session";
import MongoStore from "connect-mongo";

export const getSessionConfig = (
  configService: ConfigService,
): session.SessionOptions => {
  const isProduction = configService.get("NODE_ENV") === "production";
  console.log("Environment:", configService.get("NODE_ENV"));
  console.log("Is Production:", isProduction);
  
  const sessionConfig = {
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
      touchAfter: 24 * 3600, // Lazy session update
    }),
    cookie: {
      secure: isProduction, // Only secure in production (HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // 'none' for cross-origin in production
      path: '/',
    },
    name: "sessionId",
    proxy: isProduction, // Trust proxy in production (Cloud Run)
  };

  console.log("Session cookie config:", {
    secure: sessionConfig.cookie.secure,
    sameSite: sessionConfig.cookie.sameSite,
    path: sessionConfig.cookie.path,
    proxy: sessionConfig.proxy
  });

  return sessionConfig;
};