import React, { useState } from "react";

function Notifications({ notifications = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="notifications-container">
      <button
        className="notification-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔 Notifications

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <h3>Notifications</h3>

          {notifications.length === 0 ? (
            <p className="no-notifications">
              No notifications yet.
            </p>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification._id || index}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
              >
                <p>{notification.message}</p>

                {notification.createdAt && (
                  <small>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </small>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;