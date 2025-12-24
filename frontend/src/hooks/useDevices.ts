import { useState, useEffect, useCallback } from "react";
import type { Device, Transaction } from "../services/api";
import { deviceApi, transactionApi } from "../services/api";

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await deviceApi.getDevices();
    if (result.error) {
      setError(result.error);
    } else {
      setDevices(result.data || []);
    }
    setLoading(false);
  }, []);

  const createDevice = useCallback(
    async (name: string, deviceType: string, ipAddress: string) => {
      setError(null);
      const result = await deviceApi.createDevice({
        name,
        deviceType,
        ipAddress,
      });
      if (result.error) {
        setError(result.error);
        return { error: result.error };
      } else {
        const newDevice = result.data;
        if (newDevice) {
          setDevices((prev) => [newDevice, ...prev]);
        }
        return { data: newDevice };
      }
    },
    []
  );

  const activateDevice = useCallback(async (id: string) => {
    setError(null);
    const result = await deviceApi.activateDevice(id);
    if (result.error) {
      setError(result.error);
      return { error: result.error };
    } else {
      const updatedDevice = result.data?.device;
      if (updatedDevice) {
        setDevices((prev) =>
          prev.map((d) => (d.id === id ? updatedDevice : d))
        );
      }
      return { data: updatedDevice };
    }
  }, []);

  const deactivateDevice = useCallback(async (id: string) => {
    setError(null);
    const result = await deviceApi.deactivateDevice(id);
    if (result.error) {
      setError(result.error);
      return { error: result.error };
    } else {
      const updatedDevice = result.data?.device;
      if (updatedDevice) {
        setDevices((prev) =>
          prev.map((d) => (d.id === id ? updatedDevice : d))
        );
      }
      return { data: updatedDevice };
    }
  }, []);

  const deleteDevice = useCallback(async (id: string) => {
    setError(null);
    const result = await deviceApi.deleteDevice(id);
    if (result.error) {
      setError(result.error);
      return { error: result.error };
    } else {
      setDevices((prev) => prev.filter((d) => d.id !== id));
      return { data: result.data };
    }
  }, []);

  return {
    devices,
    loading,
    error,
    fetchDevices,
    createDevice,
    activateDevice,
    deactivateDevice,
    deleteDevice,
  };
};

export const useTransactions = (
  deviceId?: string,
  pollInterval: number = 3000
) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    let result;
    if (deviceId) {
      result = await transactionApi.getDeviceTransactions(deviceId, {
        limit: 50,
        offset: 0,
      });
    } else {
      result = await transactionApi.getTransactions({
        limit: 50,
        offset: 0,
      });
    }

    if (result.error) {
      setError(result.error);
    } else {
      setTransactions(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    }
    setLoading(false);
  }, [deviceId]);

  // Auto-poll for transactions
  useEffect(() => {
    // Fetch immediately on mount
    const controller = new AbortController();
    const fetch = async () => {
      setLoading(true);
      setError(null);

      let result;
      if (deviceId) {
        result = await transactionApi.getDeviceTransactions(deviceId, {
          limit: 100,
          offset: 0,
        });
      } else {
        result = await transactionApi.getTransactions({
          limit: 100,
          offset: 0,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        setTransactions(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      }
      setLoading(false);
    };

    fetch();
    const interval = setInterval(fetch, pollInterval);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [deviceId, pollInterval]);

  return {
    transactions,
    loading,
    error,
    pagination,
    refetch: fetchTransactions,
  };
};
