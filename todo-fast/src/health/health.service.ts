import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async getHealthStatus() {
    const dbStatus = this.getDatabaseStatus();
    const uptime = process.uptime();
    
    return {
      status: dbStatus === 'connected' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime)}s`,
      database: dbStatus,
      memory: this.getMemoryUsage(),
    };
  }

  async getDetailedHealthStatus() {
    const basicHealth = await this.getHealthStatus();
    
    return {
      ...basicHealth,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
      cpuUsage: process.cpuUsage(),
      memoryDetails: process.memoryUsage(),
      databaseDetails: {
        readyState: this.mongoConnection.readyState,
        host: this.mongoConnection.host,
        port: this.mongoConnection.port,
        name: this.mongoConnection.name,
      },
    };
  }

  private getDatabaseStatus(): string {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    return states[this.mongoConnection.readyState] || 'unknown';
  }

  private getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
    };
  }
}
