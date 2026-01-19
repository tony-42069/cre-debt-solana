import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Connection } from '@solana/web3.js';
import os from 'os';

const prisma = new PrismaClient();

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheckItem;
    solana: HealthCheckItem;
    memory: HealthCheckItem;
    disk: HealthCheckItem;
  };
}

export interface HealthCheckItem {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  latency?: number;
  details?: Record<string, unknown>;
}

async function checkDatabase(): Promise<HealthCheckItem> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      message: 'Database connection successful',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
      latency: Date.now() - start,
    };
  }
}

async function checkSolana(rpcUrl: string): Promise<HealthCheckItem> {
  const start = Date.now();
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const version = await connection.getVersion();
    return {
      status: 'healthy',
      message: 'Solana connection successful',
      latency: Date.now() - start,
      details: { version: version.solanaCore },
    };
  } catch (error) {
    return {
      status: 'degraded',
      message: error instanceof Error ? error.message : 'Solana connection failed',
      latency: Date.now() - start,
    };
  }
}

function checkMemory(): HealthCheckItem {
  const usedMemory = process.memoryUsage();
  const totalMemory = os.totalmem();
  const usedPercentage = (usedMemory.heapUsed / totalMemory) * 100;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (usedPercentage > 90) status = 'unhealthy';
  else if (usedPercentage > 75) status = 'degraded';

  return {
    status,
    message: `Memory usage: ${(usedPercentage).toFixed(2)}%`,
    details: {
      heapUsed: Math.round(usedMemory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usedMemory.heapTotal / 1024 / 1024),
      rss: Math.round(usedMemory.rss / 1024 / 1024),
      external: Math.round(usedMemory.external / 1024 / 1024),
    },
  };
}

function checkDisk(): HealthCheckItem {
  const used = process.memoryUsage().heapUsed;
  const available = Number.MAX_SAFE_INTEGER;

  const usedPercentage = (used / available) * 100;

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (usedPercentage > 95) status = 'unhealthy';
  else if (usedPercentage > 85) status = 'degraded';

  return {
    status,
    message: `Disk usage check passed`,
    details: {
      heapUsed: Math.round(used / 1024 / 1024),
      available: Math.round(available / 1024 / 1024),
    },
  };
}

export async function getHealthCheck(rpcUrl: string): Promise<HealthCheckResult> {
  const [database, solana, memory, disk] = await Promise.all([
    checkDatabase(),
    checkSolana(rpcUrl),
    Promise.resolve(checkMemory()),
    Promise.resolve(checkDisk()),
  ]);

  const checks = { database, solana, memory, disk };
  const overallStatus = Object.values(checks).every((c) => c.status === 'healthy')
    ? 'healthy'
    : Object.values(checks).some((c) => c.status === 'unhealthy')
    ? 'unhealthy'
    : 'degraded';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks,
  };
}

export async function healthCheckHandler(req: Request, res: Response) {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

  try {
    const health = await getHealthCheck(rpcUrl);
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    });
  }
}

export async function metricsHandler(req: Request, res: Response) {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  const metrics = [
    `# HELP process_uptime_seconds Process uptime in seconds`,
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${process.uptime()}`,
    ``,
    `# HELP process_memory_heap_bytes Process memory heap bytes`,
    `# TYPE process_memory_heap_bytes gauge`,
    `process_memory_heap_bytes ${memoryUsage.heapUsed}`,
    `process_memory_heap_total_bytes ${memoryUsage.heapTotal}`,
    `process_memory_rss_bytes ${memoryUsage.rss}`,
    `process_memory_external_bytes ${memoryUsage.external}`,
    ``,
    `# HELP process_cpu_user_seconds Process CPU user seconds`,
    `# TYPE process_cpu_user_seconds counter`,
    `process_cpu_user_seconds ${cpuUsage.user / 1000000}`,
    `process_cpu_system_seconds ${cpuUsage.system / 1000000}`,
    ``,
    `# HELP http_requests_total Total HTTP requests`,
    `# TYPE http_requests_total counter`,
    `http_requests_total{method="GET"} ${(req as any).methodCounts?.GET || 0}`,
    `http_requests_total{method="POST"} ${(req as any).methodCounts?.POST || 0}`,
    `http_requests_total{method="PUT"} ${(req as any).methodCounts?.PUT || 0}`,
    `http_requests_total{method="DELETE"} ${(req as any).methodCounts?.DELETE || 0}`,
  ].join('\n');

  res.set('Content-Type', 'text/plain');
  res.send(metrics);
}
