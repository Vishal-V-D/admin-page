// src/components/UserRow.jsx
import React from 'react';

export default function UserRow({ user, onUpdateStatus, onAssignRole }) {
  // Determine button colors based on user status for better visual feedback
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: 'var(--color-success)', color: 'white' };
      case 'revoked':
        return { backgroundColor: 'var(--color-danger)', color: 'white' }; // Changed to danger for revoked
      case 'pending':
        return { backgroundColor: 'var(--color-warning)', color: 'white' }; // Changed to warning for pending
      default:
        return { backgroundColor: 'var(--color-text-soft)', color: 'white' };
    }
  };

  const getActionButtonStyle = (action) => {
    switch (action) {
      case 'approve':
        return { backgroundColor: 'var(--color-success)', color: 'white' };
      case 'revoke':
        return { backgroundColor: 'var(--color-danger)', color: 'white' };
      case 'pending':
        return { backgroundColor: 'var(--color-warning)', color: 'white' };
      default:
        return {};
    }
  };

  // Reusable button class for consistency
  const buttonClass = `
    w-full px-4 py-2 rounded-lg text-sm font-semibold shadow-sm
    hover:shadow-md transition-all duration-200 transform hover:scale-105
    focus:outline-none focus:ring-2 focus:ring-opacity-75
  `;

  return (
    <div
      key={user.id}
      className="p-6 rounded-xl shadow-lg flex flex-col justify-between transform hover:scale-[1.02] transition-transform duration-300 animate-slideInRight"
      style={{
        backgroundColor: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div>
        <h3
          className="text-xl font-bold mb-2 truncate"
          style={{ color: "var(--color-text)" }}
          title={user.email}
        >
          {user.email}
        </h3>
        <p className="mb-2 text-sm" style={{ color: "var(--color-text-soft)" }}>
          Status:{" "}
          <span
            className="px-2 py-1 rounded-full text-xs font-semibold"
            style={getStatusStyle(user.status)}
          >
            {user.status
              ? user.status.charAt(0).toUpperCase() +
                user.status.slice(1)
              : "N/A"}
          </span>
        </p>
        <p
          className="mb-4 capitalize"
          style={{ color: "var(--color-text-soft)" }}
        >
          Role: {user.role || "viewer"}
        </p>
        {user.invitedAt && (
          <p
            className="text-xs italic mb-4"
            style={{ color: "var(--color-text-soft)" }}
          >
            Invited: {new Date(user.invitedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex flex-col space-y-3 mt-4">
        {user.status !== "approved" && (
          <button
            onClick={() => onUpdateStatus(user.id, "approved")}
            className={buttonClass}
            style={getActionButtonStyle('approve')}
          >
            Approve
          </button>
        )}
        {user.status !== "revoked" && (
          <button
            onClick={() => onUpdateStatus(user.id, "revoked")}
            className={buttonClass}
            style={getActionButtonStyle('revoke')}
          >
            Revoke
          </button>
        )}
        {user.status !== "pending" && (
          <button
            onClick={() => onUpdateStatus(user.id, "pending")}
            className={buttonClass}
            style={getActionButtonStyle('pending')}
          >
            Set Pending
          </button>
        )}
        <select
          value={user.role || "viewer"}
          onChange={(e) => onAssignRole(user.id, e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
          style={{
            borderColor: "var(--color-input-border)",
            backgroundColor: "var(--color-input-bg)",
            color: "var(--color-text)",
          }}
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
    </div>
  );
}