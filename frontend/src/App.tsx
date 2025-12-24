import { useEffect, useState } from "react";
import { CreateDevice } from "./components/CreateDevice";
import { DeviceList } from "./components/DeviceList";
import { TransactionView } from "./components/TransactionView";
import { useDevices, useTransactions } from "./hooks/useDevices";
import "./App.css";

function App() {
  // All state hooks first
  const [activatingId, setActivatingId] = useState<string | undefined>();
  const [deactivatingId, setDeactivatingId] = useState<string | undefined>();
  const [deletingId, setDeletingId] = useState<string | undefined>();
  const [createError, setCreateError] = useState<string | null>(null);

  // Custom hooks from our custom hook file
  const {
    devices,
    loading: devicesLoading,
    error: devicesError,
    fetchDevices,
    createDevice,
    activateDevice,
    deactivateDevice,
    deleteDevice,
  } = useDevices();

  const { transactions, loading: txnsLoading, pagination } = useTransactions();

  // All effect hooks
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  // All event handlers (not hooks, just regular functions)
  const handleCreateDevice = async (
    name: string,
    deviceType: string,
    ipAddress: string
  ) => {
    setCreateError(null);
    const result = await createDevice(name, deviceType, ipAddress);
    if (result.error) {
      setCreateError(result.error);
      throw new Error(result.error);
    }
  };

  const handleActivateDevice = async (id: string) => {
    setActivatingId(id);
    try {
      await activateDevice(id);
    } finally {
      setActivatingId(undefined);
    }
  };

  const handleDeactivateDevice = async (id: string) => {
    setDeactivatingId(id);
    try {
      await deactivateDevice(id);
    } finally {
      setDeactivatingId(undefined);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDevice(id);
    } finally {
      setDeletingId(undefined);
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🔐 Device Management System</h1>
        <p>
          Manage and monitor security devices with real-time transaction
          tracking
        </p>
      </div>

      <div className="app-content">
        <div className="device-section">
          <div className="section">
            <h2 className="section-title">Devices</h2>

            {createError && <div className="error-banner">{createError}</div>}

            <CreateDevice
              onCreate={handleCreateDevice}
              loading={devicesLoading}
            />

            {devicesError && (
              <div className="error-banner" style={{ marginTop: "15px" }}>
                {devicesError}
              </div>
            )}

            <div style={{ marginTop: "20px" }}>
              <DeviceList
                devices={devices}
                loading={devicesLoading}
                onActivate={handleActivateDevice}
                onDeactivate={handleDeactivateDevice}
                onDelete={handleDeleteDevice}
                activatingId={activatingId}
                deactivatingId={deactivatingId}
                deletingId={deletingId}
              />
            </div>
          </div>
        </div>

        <div className="transaction-section">
          <div className="section">
            <TransactionView
              transactions={transactions}
              loading={txnsLoading}
            />
            <div
              style={{
                marginTop: "10px",
                textAlign: "center",
                fontSize: "12px",
                color: "#999",
              }}
            >
              Total transactions: {pagination.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
