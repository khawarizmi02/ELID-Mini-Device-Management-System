import { useState } from "react";
import "../styles/CreateDevice.css";

const DEVICE_TYPES = ["access_controller", "face_reader", "anpr"];

interface CreateDeviceProps {
  onCreate: (
    name: string,
    deviceType: string,
    ipAddress: string
  ) => Promise<void>;
  loading?: boolean;
}

export const CreateDevice = ({
  onCreate,
  loading = false,
}: CreateDeviceProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    deviceType: "access_controller",
    ipAddress: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Device name is required");
      return;
    }
    if (!formData.ipAddress.trim()) {
      setError("IP address is required");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(formData.name, formData.deviceType, formData.ipAddress);
      setFormData({
        name: "",
        deviceType: "access_controller",
        ipAddress: "",
      });
      setShowForm(false);
    } catch {
      setError("Failed to create device");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-device-container">
      {!showForm ? (
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          + Add New Device
        </button>
      ) : (
        <div className="create-device-form">
          <h3>Create New Device</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Device Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Main Gate, Parking Entrance"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="deviceType">Device Type</label>
              <select
                id="deviceType"
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                disabled={submitting}
              >
                {DEVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ipAddress">IP Address</label>
              <input
                type="text"
                id="ipAddress"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                placeholder="e.g., 192.168.1.100"
                disabled={submitting}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || loading}
              >
                {submitting ? "Creating..." : "Create Device"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
