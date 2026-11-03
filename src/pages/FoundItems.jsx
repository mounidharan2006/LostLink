import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";

function FoundItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/items/found");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load found items.");
      }

      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundItems();
  }, []);

  return (
    <div className="items-page">
      <div className="items-page-header">
        <h1>Found Items</h1>
        <p>Browse items found and reported by students.</p>
      </div>

      {loading && <p>Loading found items...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <h3>No Found Items Available</h3>
          <p>There are currently no active found-item reports.</p>
        </div>
      )}

      <div className="items-grid">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>

      <button
        className="refresh-button"
        onClick={fetchFoundItems}
        disabled={loading}
      >
        Refresh Found Items
      </button>
    </div>
  );
}

export default FoundItems;