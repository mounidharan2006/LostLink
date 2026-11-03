import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";

function LostItems({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLostItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/items/lost");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load lost items.");
      }

      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  return (
    <div className="items-page">
      <div className="items-page-header">
        <h1>Lost Items</h1>
        <p>Browse items reported missing by students.</p>
      </div>

      {loading && <p>Loading lost items...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <h3>No Lost Items Found</h3>
          <p>There are currently no active lost-item reports.</p>
        </div>
      )}

      <div className="items-grid">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>

      <button
        className="refresh-button"
        onClick={fetchLostItems}
        disabled={loading}
      >
        Refresh Lost Items
      </button>
    </div>
  );
}

export default LostItems;