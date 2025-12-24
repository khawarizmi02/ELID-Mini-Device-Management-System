import type { Device } from "../services/api";
import "../styles/DeviceList.css";

interface DeviceListProps {
  devices: Device[];
  loading: boolean;
  onActivate: (id: string) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  activatingId?: string;
  deactivatingId?: string;
  deletingId?: string;
}

export const DeviceList = ({
  devices,
  loading,
  onActivate,
  onDeactivate,
  onDelete,
  activatingId,
  deactivatingId,
  deletingId,
}: DeviceListProps) => {
  if (loading && devices.length === 0) {
    return (
      <div className="device-list-container">
        <div className="loading">Loading devices...</div>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="device-list-container">
        <div className="empty-state">
          <p>No devices found. Create one to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="device-list-container">
      <div className="device-list">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`device-card status-${device.status}`}
          >
            <div className="device-header">
              <div className="device-info">
                <h3>{device.name}</h3>
                <p className="device-type">{device.deviceType}</p>
                <p className="device-ip">{device.ipAddress}</p>
              </div>
              <div className="device-status">
                <span className={`status-badge status-${device.status}`}>
                  {device.status.charAt(0).toUpperCase() +
                    device.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="device-actions">
              {device.status === "inactive" ? (
                <button
                  className="btn btn-primary"
                  onClick={() => onActivate(device.id)}
                  disabled={activatingId === device.id}
                >
                  {activatingId === device.id ? "Activating..." : "Activate"}
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={() => onDeactivate(device.id)}
                  disabled={deactivatingId === device.id}
                >
                  {deactivatingId === device.id
                    ? "Deactivating..."
                    : "Deactivate"}
                </button>
              )}
              <button
                className="btn btn-delete"
                onClick={() => {
                  if (
                    confirm(`Are you sure you want to delete "${device.name}"?`)
                  ) {
                    onDelete(device.id);
                  }
                }}
                disabled={deletingId === device.id}
              >
                {deletingId === device.id ? "Deleting..." : "Delete"}
              </button>
            </div>

            <div className="device-meta">
              <small>ID: {device.id.substring(0, 8)}...</small>
              <small>
                Created: {new Date(device.createdAt).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
