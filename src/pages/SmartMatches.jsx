import { useEffect, useState } from "react";
import "./SmartMatches.css";

function SmartMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("lostlinkToken");

      if (!token) {
        setError("Please login to view Smart Matches.");
        return;
      }

      const response = await fetch("/api/items/matches", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load matches.");
      }

      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const getMatchLabel = (score) => {
    if (score >= 80) return "Strong Match";
    if (score >= 60) return "Good Match";
    return "Possible Match";
  };

  return (
    <div className="sl-container">

      <div className="sl-header">
        <span className="sl-tag">INTELLIGENT SEARCH</span>
        <h1>🤖 Smart Matches</h1>
        <p>Discover possible matches for your lost and found items.</p>

        <button className="sl-refresh" onClick={loadMatches}>
          ↻ Refresh Matches
        </button>
      </div>

      {loading && (
        <div className="sl-message">
          Finding possible matches...
        </div>
      )}

      {error && (
        <div className="sl-error">
          {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="sl-empty">
          <div className="sl-empty-icon">🔍</div>
          <h2>No Matches Found Yet</h2>
          <p>
            When another student reports an item matching yours,
            the possible match will appear here.
          </p>
        </div>
      )}

      <div className="sl-grid">
        {matches.map((match, index) => (
          <div className="sl-card" key={index}>

            <div className="sl-score">
              <div>
                <strong>{match.matchScore}%</strong>
                <span>{getMatchLabel(match.matchScore)}</span>
              </div>
              <span className="sl-badge">Possible Match</span>
            </div>

            <div className="sl-items">

              <div className="sl-item sl-lost">
                <h3>🔴 Lost Item</h3>
                <h4>{match.lostItem.title}</h4>
                <p>{match.lostItem.description}</p>
                <p><strong>Category:</strong> {match.lostItem.category}</p>
                <p><strong>Location:</strong> {match.lostItem.location}</p>
              </div>

              <div className="sl-item sl-found">
                <h3>🟢 Found Item</h3>
                <h4>{match.foundItem.title}</h4>
                <p>{match.foundItem.description}</p>
                <p><strong>Category:</strong> {match.foundItem.category}</p>
                <p><strong>Location:</strong> {match.foundItem.location}</p>
              </div>

            </div>

            <div className="sl-reasons">
              <h4>Why this may be a match</h4>

              {match.reasons.map((reason, i) => (
                <span key={i}>✓ {reason}</span>
              ))}
            </div>

            <p className="sl-note">
              This is an automatically calculated possible match.
              Verify the item before claiming it.
            </p>

          </div>
        ))}
      </div>

    </div>
  );
}

export default SmartMatches;