import type { Request, Response } from "express";
import { DeviceService, TransactionService } from "./services";

export class DeviceHandler {
  constructor(private deviceService: DeviceService) {}

  async createDevice(req: Request, res: Response): Promise<void> {
    const { name, deviceType, ipAddress } = req.body;

    if (!name || !deviceType || !ipAddress) {
      res.status(400).json({
        error: "Missing required fields: name, deviceType, ipAddress",
      });
      return;
    }

    const result = await this.deviceService.createDevice({
      name,
      deviceType,
      ipAddress,
    });

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.status(201).json(result.device);
  }

  async getAllDevices(req: Request, res: Response): Promise<void> {
    const result = await this.deviceService.getAllDevices();

    if (!result.success) {
      res.status(500).json({ error: result.error });
      return;
    }

    res.json(result.devices);
  }

  async getDeviceById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.deviceService.getDeviceById(id);

    if (!result.success) {
      res.status(404).json({ error: result.error });
      return;
    }

    res.json(result.device);
  }

  async activateDevice(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.deviceService.activateDevice(id);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: "Device activated successfully",
      device: result.device,
    });
  }

  async deactivateDevice(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.deviceService.deactivateDevice(id);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: "Device deactivated successfully",
      device: result.device,
    });
  }

  async deleteDevice(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.deviceService.deleteDevice(id);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    res.json({
      message: "Device deleted successfully",
    });
  }
}

export class TransactionHandler {
  constructor(private transactionService: TransactionService) {}

  async getTransactions(req: Request, res: Response): Promise<void> {
    const { deviceId, limit, offset } = req.query;

    const result = await this.transactionService.getTransactions({
      deviceId: deviceId as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    if (!result.success) {
      res.status(500).json({ error: result.error });
      return;
    }

    res.json({
      transactions: result.transactions,
      pagination: result.pagination,
    });
  }

  async getDeviceTransactions(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { limit, offset } = req.query;

    const result = await this.transactionService.getDeviceTransactions(id, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    if (!result.success) {
      res.status(500).json({ error: result.error });
      return;
    }

    res.json({
      deviceId: id,
      transactions: result.transactions,
      pagination: result.pagination,
    });
  }
}
