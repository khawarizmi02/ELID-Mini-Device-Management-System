import { Router } from "express";
import { DeviceHandler, TransactionHandler } from "./handlers";

export function createDeviceRoutes(deviceHandler: DeviceHandler): Router {
  const router = Router();

  // Device management routes
  router.post("/devices", (req, res) => deviceHandler.createDevice(req, res));
  router.get("/devices", (req, res) => deviceHandler.getAllDevices(req, res));
  router.get("/devices/:id", (req, res) =>
    deviceHandler.getDeviceById(req, res)
  );
  router.post("/devices/:id/activate", (req, res) =>
    deviceHandler.activateDevice(req, res)
  );
  router.post("/devices/:id/deactivate", (req, res) =>
    deviceHandler.deactivateDevice(req, res)
  );
  router.delete("/devices/:id", (req, res) =>
    deviceHandler.deleteDevice(req, res)
  );

  return router;
}

export function createTransactionRoutes(
  transactionHandler: TransactionHandler
): Router {
  const router = Router();

  // Transaction routes
  router.get("/transactions", (req, res) =>
    transactionHandler.getTransactions(req, res)
  );
  router.get("/devices/:id/transactions", (req, res) =>
    transactionHandler.getDeviceTransactions(req, res)
  );

  return router;
}
