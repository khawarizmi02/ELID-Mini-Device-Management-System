import { v4 as uuidv4 } from "uuid";
import { DeviceRepository, TransactionRepository } from "./repositories";
import { DEVICE_TYPES, SAMPLE_USERNAMES, EVENT_TYPES } from "./constants";
import { getRandomItem, getRandomInterval, logger } from "./utils";

/**
 * Service for managing device lifecycle and transaction generation
 */
export class DeviceService {
  private activeDeviceProcesses: Map<string, NodeJS.Timeout[]> = new Map();

  constructor(
    private deviceRepository: DeviceRepository,
    private transactionRepository: TransactionRepository
  ) {}

  /**
   * Create a new device
   */
  async createDevice(data: {
    name: string;
    deviceType: string;
    ipAddress: string;
  }): Promise<{
    success: boolean;
    device?: any;
    error?: string;
  }> {
    try {
      // Validate device type
      if (!DEVICE_TYPES.includes(data.deviceType)) {
        return {
          success: false,
          error: `Invalid device type. Must be one of: ${DEVICE_TYPES.join(
            ", "
          )}`,
        };
      }

      const device = await this.deviceRepository.create(data);
      logger.info(`Device created: ${device.id}`, { name: device.name });

      return {
        success: true,
        device,
      };
    } catch (error) {
      logger.error("Error creating device", error);
      return {
        success: false,
        error: "Failed to create device",
      };
    }
  }

  /**
   * Get all devices
   */
  async getAllDevices(): Promise<{
    success: boolean;
    devices?: any;
    error?: string;
  }> {
    try {
      const devices = await this.deviceRepository.findAll();
      return {
        success: true,
        devices,
      };
    } catch (error) {
      logger.error("Error fetching devices", error);
      return {
        success: false,
        error: "Failed to fetch devices",
      };
    }
  }

  /**
   * Get a single device by ID
   */
  async getDeviceById(id: string): Promise<{
    success: boolean;
    device?: any;
    error?: string;
  }> {
    try {
      const device = await this.deviceRepository.findById(id);

      if (!device) {
        return {
          success: false,
          error: "Device not found",
        };
      }

      return {
        success: true,
        device,
      };
    } catch (error) {
      logger.error("Error fetching device", error);
      return {
        success: false,
        error: "Failed to fetch device",
      };
    }
  }

  /**
   * Activate a device and start transaction generation
   */
  async activateDevice(id: string): Promise<{
    success: boolean;
    device?: any;
    error?: string;
  }> {
    try {
      const device = await this.deviceRepository.findById(id);

      if (!device) {
        return {
          success: false,
          error: "Device not found",
        };
      }

      if (device.status === "active") {
        return {
          success: false,
          error: "Device is already active",
        };
      }

      // Update device status
      const updatedDevice = await this.deviceRepository.updateStatus(
        id,
        "active"
      );

      // Start transaction generation
      this.startTransactionGeneration(id);

      logger.info(`Device activated: ${id}`);

      return {
        success: true,
        device: updatedDevice,
      };
    } catch (error) {
      logger.error("Error activating device", error);
      return {
        success: false,
        error: "Failed to activate device",
      };
    }
  }

  /**
   * Deactivate a device and stop transaction generation
   */
  async deactivateDevice(id: string): Promise<{
    success: boolean;
    device?: any;
    error?: string;
  }> {
    try {
      const device = await this.deviceRepository.findById(id);

      if (!device) {
        return {
          success: false,
          error: "Device not found",
        };
      }

      if (device.status === "inactive") {
        return {
          success: false,
          error: "Device is already inactive",
        };
      }

      // Stop transaction generation
      this.stopTransactionGeneration(id);

      // Update device status
      const updatedDevice = await this.deviceRepository.updateStatus(
        id,
        "inactive"
      );

      logger.info(`Device deactivated: ${id}`);

      return {
        success: true,
        device: updatedDevice,
      };
    } catch (error) {
      logger.error("Error deactivating device", error);
      return {
        success: false,
        error: "Failed to deactivate device",
      };
    }
  }

  /**
   * Delete a device and stop transaction generation
   */
  async deleteDevice(id: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const device = await this.deviceRepository.findById(id);

      if (!device) {
        return {
          success: false,
          error: "Device not found",
        };
      }

      // Stop transaction generation if active
      if (device.status === "active") {
        this.stopTransactionGeneration(id);
      }

      // Delete the device (cascade delete transactions via Prisma)
      await this.deviceRepository.delete(id);

      logger.info(`Device deleted: ${id}`);

      return {
        success: true,
      };
    } catch (error) {
      logger.error("Error deleting device", error);
      return {
        success: false,
        error: "Failed to delete device",
      };
    }
  }

  /**
   * Start transaction generation for a device
   */
  private startTransactionGeneration(deviceId: string): void {
    logger.info(`Starting transaction generation for device: ${deviceId}`);

    const timeouts: NodeJS.Timeout[] = [];

    const generateTransaction = async () => {
      try {
        await this.transactionRepository.create({
          deviceId,
          username: getRandomItem(SAMPLE_USERNAMES),
          eventType: getRandomItem(EVENT_TYPES),
          timestamp: new Date(),
          payload: {
            source: "device_subprocess",
            generated_at: new Date().toISOString(),
          },
        });

        logger.debug(`Transaction created for device: ${deviceId}`);

        // Schedule next transaction
        const nextInterval = getRandomInterval();
        const nextTimeout = setTimeout(generateTransaction, nextInterval);
        timeouts.push(nextTimeout);
      } catch (error) {
        logger.error(
          `Error creating transaction for device ${deviceId}`,
          error
        );
      }
    };

    // Start the first transaction generation
    const initialInterval = getRandomInterval();
    const firstTimeout = setTimeout(generateTransaction, initialInterval);
    timeouts.push(firstTimeout);

    this.activeDeviceProcesses.set(deviceId, timeouts);
  }

  /**
   * Stop transaction generation for a device
   */
  private stopTransactionGeneration(deviceId: string): void {
    logger.info(`Stopping transaction generation for device: ${deviceId}`);

    const timeouts = this.activeDeviceProcesses.get(deviceId);
    if (timeouts) {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      this.activeDeviceProcesses.delete(deviceId);
    }
  }

  /**
   * Stop all active device processes (for graceful shutdown)
   */
  stopAllProcesses(): void {
    logger.info("Stopping all active device processes...");
    this.activeDeviceProcesses.forEach((timeouts) => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    });
    this.activeDeviceProcesses.clear();
  }

  /**
   * Get count of active devices
   */
  getActiveDeviceCount(): number {
    return this.activeDeviceProcesses.size;
  }
}

/**
 * Service for managing transactions
 */
export class TransactionService {
  constructor(private transactionRepository: TransactionRepository) {}

  /**
   * Get all transactions with optional filtering
   */
  async getTransactions(options: {
    deviceId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    transactions?: any;
    pagination?: any;
    error?: string;
  }> {
    try {
      const limit = Math.min(options.limit || 100, 1000); // Max 1000
      const offset = options.offset || 0;

      const { transactions, total } = await this.transactionRepository.findAll({
        deviceId: options.deviceId,
        limit,
        offset,
      });

      return {
        success: true,
        transactions,
        pagination: {
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      logger.error("Error fetching transactions", error);
      return {
        success: false,
        error: "Failed to fetch transactions",
      };
    }
  }

  /**
   * Get transactions for a specific device
   */
  async getDeviceTransactions(
    deviceId: string,
    options: {
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    success: boolean;
    transactions?: any;
    pagination?: any;
    error?: string;
  }> {
    try {
      const limit = Math.min(options.limit || 100, 1000); // Max 1000
      const offset = options.offset || 0;

      const { transactions, total } =
        await this.transactionRepository.findByDeviceId({
          deviceId,
          limit,
          offset,
        });

      return {
        success: true,
        transactions,
        pagination: {
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      logger.error("Error fetching device transactions", error);
      return {
        success: false,
        error: "Failed to fetch device transactions",
      };
    }
  }
}
