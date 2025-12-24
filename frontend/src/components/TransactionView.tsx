import type { Transaction } from "../services/api";
import "../styles/TransactionView.css";

interface TransactionViewProps {
  transactions: Transaction[];
  loading: boolean;
  deviceName?: string;
}

export const TransactionView = ({
  transactions,
  loading,
  deviceName,
}: TransactionViewProps) => {
  return (
    <div className="transaction-view-container">
      <div className="transaction-header">
        <h2>
          {deviceName ? `Transactions - ${deviceName}` : "Recent Transactions"}
        </h2>
        <div className="transaction-count">
          {loading && <span className="loading-indicator">Updating...</span>}
          <span className="count">{transactions.length} transactions</span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions yet.</p>
          {deviceName && <p>Activate a device to generate transactions.</p>}
        </div>
      ) : (
        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Username</th>
                <th>Event Type</th>
                <th>Device</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className={`event-${tx.eventType}`}>
                  <td className="timestamp">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="username">{tx.username}</td>
                  <td className="event-type">
                    <span className={`badge badge-${tx.eventType}`}>
                      {tx.eventType.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="device-id">
                    {tx.device?.name || tx.deviceId.substring(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="transaction-footer">
        <small>
          Auto-updating every 3 seconds • {new Date().toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};
