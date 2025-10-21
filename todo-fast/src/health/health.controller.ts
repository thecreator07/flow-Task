import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getRoot() {
    return {
      message: 'Todo Fast API is running!',
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get('health')
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  @Get('health/detailed')
  async getDetailedHealth() {
    return this.healthService.getDetailedHealthStatus();
  }
}
