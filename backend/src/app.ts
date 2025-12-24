import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { DeviceService, TransactionService } from "./services";
import { DeviceRepository, TransactionRepository } from "./repositories";
import { DeviceHandler, TransactionHandler } from "./handlers";
import { createDeviceRoutes, createTransactionRoutes } from "./routes";
import { logger } from "./utils";

export function createApp() {
  const app = express();
  const prisma = new PrismaClient();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Initialize repositories
  const deviceRepository = new DeviceRepository(prisma);
  const transactionRepository = new TransactionRepository(prisma);

  // Initialize services
  const deviceService = new DeviceService(
    deviceRepository,
    transactionRepository
  );
  const transactionService = new TransactionService(transactionRepository);

  // Initialize handlers
  const deviceHandler = new DeviceHandler(deviceService);
  const transactionHandler = new TransactionHandler(transactionService);

  // Health check route
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      activeDevices: deviceService.getActiveDeviceCount(),
    });
  });

  // Register routes
  app.use("/", createDeviceRoutes(deviceHandler));
  app.use("/", createTransactionRoutes(transactionHandler));

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      logger.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  // Graceful shutdown handler
  const shutdown = () => {
    logger.info("🛑 Shutting down server...");
    deviceService.stopAllProcesses();
    prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return { app, prisma, deviceService };
}
