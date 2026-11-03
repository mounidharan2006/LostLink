import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";

function MyReports({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyReports = async () => {
    if (!token) {
      setError("Please login to view your reports.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/items/my-reports", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your reports.");
      }

      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId, status) => {
    try {
      const response = await fetch(`/api/items/${itemId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed.");
      }

      await fetchMyReports();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [token]);

  return (
    <div className="items-page">
      <div className="items-page-header">
        <h1>My Reports</h1>
        <p>Manage all the items you have reported.</p>
      </div>

      {loading && <p>Loading your reports...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <h3>No Reports Yet</h3>
          <p>Your lost and found reports will appear here.</p>
        </div>
      )}

      <div className="items-grid">
        {items.map((item) => (
          <ItemCard
            key={item._id}
            item={item}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>

      <button
        className="refresh-button"
        onClick={fetchMyReports}
        disabled={loading}
      >
        Refresh My Reports
      </button>
    </div>
  );
}

export default MyReports;