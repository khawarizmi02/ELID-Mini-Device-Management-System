/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

// In Docker with Nginx, use /api/ prefix to proxy to backend
// In dev, use direct backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:3000");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Device {
  id: string;
  name: string;
  deviceType: string;
  ipAddress: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  deviceId: string;
  username: string;
  eventType: string;
  timestamp: string;
  payload?: Record<string, any>;
  createdAt: string;
  device?: Device;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

// Device API endpoints
export const deviceApi = {
  // Create a new device
  async createDevice(
    data: Omit<Device, "id" | "status" | "createdAt" | "updatedAt">
  ) {
    try {
      const response = await apiClient.post<Device>("/devices", data);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || "Failed to create device",
      };
    }
  },

  // Get all devices
  async getDevices() {
    try {
      const response = await apiClient.get<Device[]>("/devices");
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || "Failed to fetch devices",
      };
    }
  },

  // Get a single device
  async getDevice(id: string) {
    try {
      const response = await apiClient.get<Device>(`/devices/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.response?.data?.error || "Failed to fetch device" };
    }
  },

  // Activate a device
  async activateDevice(id: string) {
    try {
      const response = await apiClient.post<{
        message: string;
        device: Device;
      }>(`/devices/${id}/activate`);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || "Failed to activate device",
      };
    }
  },

  // Deactivate a device
  async deactivateDevice(id: string) {
    try {
      const response = await apiClient.post<{
        message: string;
        device: Device;
      }>(`/devices/${id}/deactivate`);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || "Failed to deactivate device",
      };
    }
  },

  // Delete a device
  async deleteDevice(id: string) {
    try {
      const response = await apiClient.delete<{
        message: string;
      }>(`/devices/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || "Failed to delete device",
      };
    }
  },
};

// Transaction API endpoints
export const transactionApi = {
  // Get all transactions with optional filtering
  async getTransactions(options?: {
    deviceId?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const response = await apiClient.get<{
        transactions: Transaction[];
        pagination: PaginationInfo;
      }>("/transactions", { params: options });
      return {
        data: response.data.transactions,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.error || "Failed to fetch transactions",
      };
    }
  },

  // Get transactions for a specific device
  async getDeviceTransactions(
    deviceId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      const response = await apiClient.get<{
        deviceId: string;
        transactions: Transaction[];
        pagination: PaginationInfo;
      }>(`/devices/${deviceId}/transactions`, { params: options });
      return {
        data: response.data.transactions,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      return {
        error:
          error.response?.data?.error || "Failed to fetch device transactions",
      };
    }
  },
};

// Health check
export const healthApi = {
  async check() {
    try {
      const response = await apiClient.get("/health");
      return { data: response.data };
    } catch (error: any) {
      return { error: "Health check failed", message: error };
    }
  },
};
