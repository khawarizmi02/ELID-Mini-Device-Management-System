import { PrismaClient } from "@prisma/client";
import type { Device, Transaction } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class DeviceRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    name: string;
    deviceType: string;
    ipAddress: string;
  }): Promise<Device> {
    return this.prisma.device.create({
      data: {
        id: uuidv4(),
        name: data.name,
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        status: "inactive",
      },
    });
  }

  async findAll(): Promise<Device[]> {
    return this.prisma.device.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string): Promise<Device> {
    return this.prisma.device.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<Device> {
    return this.prisma.device.delete({
      where: { id },
    });
  }
}

export class TransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    deviceId: string;
    username: string;
    eventType: string;
    timestamp: Date;
    payload?: any;
  }): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        id: uuidv4(),
        deviceId: data.deviceId,
        username: data.username,
        eventType: data.eventType,
        timestamp: data.timestamp,
        payload: data.payload || null,
      },
    });
  }

  async findAll(options: {
    deviceId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    const whereClause: any = {};
    if (options.deviceId) {
      whereClause.deviceId = options.deviceId;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: whereClause,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
        include: {
          device: true,
        },
      }),
      this.prisma.transaction.count({
        where: whereClause,
      }),
    ]);

    return { transactions, total };
  }

  async findByDeviceId(options: {
    deviceId: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { deviceId: options.deviceId },
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.transaction.count({
        where: { deviceId: options.deviceId },
      }),
    ]);

    return { transactions, total };
  }
}
