import React from "react";

function ItemCard({ item, onStatusUpdate }) {
  if (!item) return null;

  const isLost = item.type === "lost";

  const handleStatusChange = () => {
    if (onStatusUpdate) {
      onStatusUpdate(item._id, "returned");
    }
  };

  return (
    <div className="item-card">
      <div className="item-card-image">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="item-placeholder">
            {isLost ? "🔍" : "📦"}
          </div>
        )}
      </div>

      <div className="item-card-content">
        <div className="item-card-header">
          <span className={isLost ? "lost-badge" : "found-badge"}>
            {isLost ? "LOST ITEM" : "FOUND ITEM"}
          </span>

          <span className="item-status">
            {item.status || "active"}
          </span>
        </div>

        <h3>{item.title}</h3>

        <p>{item.description}</p>

        <div className="item-details">
          <p>
            <strong>Category:</strong> {item.category}
          </p>

          <p>
            <strong>Location:</strong> {item.location}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {item.date
              ? new Date(item.date).toLocaleDateString()
              : "Not available"}
          </p>

          {item.reportedBy?.name && (
            <p>
              <strong>Reported by:</strong> {item.reportedBy.name}
            </p>
          )}
        </div>

        {item.status === "active" && onStatusUpdate && (
          <button
            className="item-status-button"
            onClick={handleStatusChange}
          >
            Mark as Returned
          </button>
        )}
      </div>
    </div>
  );
}

export default ItemCard;