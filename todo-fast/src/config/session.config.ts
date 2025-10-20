import { ConfigService } from "@nestjs/config";
import * as session from "express-session";
import MongoStore from "connect-mongo";

export const getSessionConfig = (
  configService: ConfigService,
): session.SessionOptions => {
  const isProduction = configService.get("NODE_ENV") === "production";
  const sessionSecret = configService.get<string>("SESSION_SECRET");
  
  // Validate session secret in production
  if (isProduction && (!sessionSecret || sessionSecret === "default-session-secret-change-in-production")) {
    throw new Error("SESSION_SECRET must be set to a secure value in production");
  }

  return {
    secret: sessionSecret || "default-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    store: MongoStore.create({
      mongoUrl: configService.get<string>("MONGODB_URI"),
      dbName: "todo-fast",
      collectionName: "sessions",
      ttl: isProduction ? 12 * 60 * 60 : 24 * 60 * 60, // 12h in prod, 24h in dev
      touchAfter: 24 * 3600, // Lazy session update
    }),
    cookie: {
      secure: isProduction, // HTTPS required in production
      httpOnly: true, 
      maxAge: isProduction ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 12h in prod, 24h in dev
      sameSite: isProduction ? "none" : "lax",
      // Don't set domain in production to allow cross-origin cookies
      domain: undefined
    },
    name: "sessionId", 
  };
};
