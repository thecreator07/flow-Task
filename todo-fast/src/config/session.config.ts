import { ConfigService } from "@nestjs/config";
import * as session from "express-session";
import MongoStore from "connect-mongo";

export const getSessionConfig = (
  configService: ConfigService,
): session.SessionOptions => {
  const isProduction = configService.get("NODE_ENV") === "production";

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
      secure: isProduction, 
      httpOnly: true, 
      maxAge: 24 * 60 * 60 * 1000, 
      sameSite: isProduction ? "none" : "lax",
      // Don't set domain in production to allow cross-origin cookies
      domain: isProduction ? undefined : undefined
    },
    name: "sessionId", 
  };
};
