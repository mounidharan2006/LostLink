import { useEffect, useState } from "react";
import SmartMatches from "./pages/SmartMatches";
import "./App.css";

function App() {
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState("Lost");

  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lostlinkUser")) || null;
    } catch {
      return null;
    }
  });

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [form, setForm] = useState({
    name: "",
    category: "Electronics",
    location: "",
    date: "",
    description: ""
  });

  const loadItems = async () => {
    setItemsLoading(true);
    setItemsError("");

    try {
      const response = await fetch("/api/items");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reports.");
      }

      const reports = Array.isArray(data) ? data : data.items || [];

      setItems(
        reports.map((item) => ({
          id: item._id,
          name: item.title,
          category: item.category,
          location: item.location,
          date: item.date
            ? new Date(item.date).toLocaleDateString("en-IN")
            : "Date not available",
          type: item.type === "lost" ? "Lost" : "Found",
          emoji: item.type === "lost" ? "🔍" : "📦",
          description: item.description,
          image: item.image || "",
          status: item.status || "active"
        }))
      );
    } catch (error) {
      setItemsError(error.message);
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "All" || item.type === filter;

    return matchesSearch && matchesFilter;
  });

  const openAuth = (type) => {
    setAuthType(type);
    setAuthMessage("");
    setAuthForm({ name: "", email: "", password: "" });
    setShowAuth(true);
  };

  const openForm = (type) => {
    if (!currentUser) {
      alert("Please login before reporting an item.");
      openAuth("login");
      return;
    }

    setReportType(type);
    setForm({
      name: "",
      category: "Electronics",
      location: "",
      date: "",
      description: ""
    });
    setShowForm(true);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    setAuthLoading(true);

    try {
      const endpoint =
        authType === "login"
          ? "/api/auth/login"
          : "/api/auth/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (authType === "register") {
        setAuthMessage("Registration successful! Please login.");
        setAuthType("login");
        setAuthForm({
          name: "",
          email: authForm.email,
          password: ""
        });
        return;
      }

      localStorage.setItem("lostlinkToken", data.token);
      localStorage.setItem("lostlinkUser", JSON.stringify(data.user));

      setCurrentUser(data.user);
      setShowAuth(false);

      alert("Welcome to LostLink, " + data.user.name + "!");
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lostlinkToken");
    localStorage.removeItem("lostlinkUser");
    setCurrentUser(null);
    alert("You have logged out successfully.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("lostlinkToken");

    if (!token) {
      alert("Please login again.");
      setShowForm(false);
      openAuth("login");
      return;
    }

    setReportLoading(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.name,
          description: form.description,
          category: form.category,
          type: reportType.toLowerCase(),
          location: form.location,
          date: form.date,
          image: ""
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit report.");
      }

      setShowForm(false);
      await loadItems();
      alert(`${reportType} item report saved successfully!`);
    } catch (error) {
      alert(error.message);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="app">

      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">🔍</span>
          <span>Lost<span className="logo-highlight">Link</span></span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#items">Lost & Found</a>
          <a href="#smart-matches">Smart Matches 🤖</a>
          <a href="#how">How It Works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          {currentUser ? (
            <>
              <span>Hi, {currentUser.name}</span>
              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="login-btn" onClick={() => openAuth("login")}>
                Login
              </button>
              <button className="signup-btn" onClick={() => openAuth("register")}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-tag">✨ Smart Campus Lost & Found Platform</div>

          <h1>
            Lost Something?
            <br />
            <span>Let's Find It Together.</span>
          </h1>

          <p>
            Never lose hope when you lose your belongings.
            LostLink connects lost and found items across your campus.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => openForm("Lost")}>
              🔍 Report Lost Item
            </button>

            <button className="secondary-btn" onClick={() => openForm("Found")}>
              📦 Report Found Item
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <h3>{items.length}</h3>
              <span>Total Reports</span>
            </div>
            <div>
              <h3>{items.filter((i) => i.type === "Lost").length}</h3>
              <span>Lost Items</span>
            </div>
            <div>
              <h3>{items.filter((i) => i.type === "Found").length}</h3>
              <span>Found Items</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-circle">
            <div className="search-emoji">🔎</div>
            <div className="floating-item item-one">🎒</div>
            <div className="floating-item item-two">🔑</div>
            <div className="floating-item item-three">📱</div>
            <div className="floating-item item-four">👛</div>
          </div>

          <div className="match-card">
            <span className="match-icon">✅</span>
            <div>
              <strong>Smart Match Found!</strong>
              <p>Potential match detected</p>
            </div>
            <span className="match-percent">93%</span>
          </div>
        </div>
      </section>

      <section className="features" id="about">
        <div className="section-heading">
          <span>WHY LOSTLINK?</span>
          <h2>Finding Lost Items Made Smarter</h2>
          <p>Everything you need to recover your belongings.</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon purple">🧠</div>
            <h3>Smart Matching</h3>
            <p>Automatically compares lost and found reports using item details.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">🔔</div>
            <h3>Notifications</h3>
            <p>View potential matches identified by the platform.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">🛡️</div>
            <h3>Secure Verification</h3>
            <p>Verify ownership before returning an item.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">📍</div>
            <h3>Location Based Search</h3>
            <p>Find belongings using campus locations and categories.</p>
          </div>
        </div>
      </section>

      <section className="items-section" id="items">
        <div className="items-heading">
          <div>
            <span className="small-title">EXPLORE REPORTS</span>
            <h2>Recent Lost & Found Items</h2>
            <p>Discover items reported by your campus community.</p>
          </div>

          <button className="primary-btn" onClick={() => openForm("Lost")}>
            + Add Report
          </button>
        </div>

        <div className="search-area">
          <input
            type="text"
            placeholder="🔍 Search by item name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-buttons">
            {["All", "Lost", "Found"].map((type) => (
              <button
                key={type}
                className={filter === type ? "active-filter" : ""}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {itemsError && (
          <div className="api-message error-message">
            {itemsError}
            <button onClick={loadItems}>Retry</button>
          </div>
        )}

        {itemsLoading ? (
          <div className="api-message">Loading reports...</div>
        ) : (
          <div className="item-grid">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div className="item-card" key={item.id}>
                  <div className="item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>{item.emoji}</span>
                    )}

                    <span className={item.type === "Lost" ? "lost-label" : "found-label"}>
                      {item.type}
                    </span>
                  </div>

                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>📂 {item.category}</p>
                    <p>📍 {item.location}</p>
                    <p>📅 {item.date}</p>

                    <div className="item-bottom">
                      <span>Campus Report</span>
                      <button onClick={() => alert(item.description)}>
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>No items found</h3>
                <p>Try another search or category.</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section id="smart-matches">
        <SmartMatches />
      </section>

      <section className="how-section" id="how">
        <div className="section-heading">
          <span>SIMPLE PROCESS</span>
          <h2>How LostLink Works</h2>
          <p>Recover your belongings in four simple steps.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div>📝</div>
            <h3>01. Report</h3>
            <p>Submit your lost or found item details.</p>
          </div>

          <div className="step-card">
            <div>🧠</div>
            <h3>02. Match</h3>
            <p>Our algorithm identifies potential matches.</p>
          </div>

          <div className="step-card">
            <div>🔔</div>
            <h3>03. Notify</h3>
            <p>Check your account for possible matches.</p>
          </div>

          <div className="step-card">
            <div>🤝</div>
            <h3>04. Recover</h3>
            <p>Verify ownership and recover your item.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="logo">
          🔍 Lost<span className="logo-highlight">Link</span>
        </div>
        <p>Connecting lost belongings with their rightful owners.</p>
        <span>© 2026 LostLink. All Rights Reserved.</span>
      </footer>

      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAuth(false)}>
              ✕
            </button>

            <h2>{authType === "login" ? "Welcome Back!" : "Create Your Account"}</h2>
            <p>
              {authType === "login"
                ? "Login to continue to LostLink."
                : "Register to join the LostLink community."}
            </p>

            <form onSubmit={handleAuth}>
              {authType === "register" && (
                <>
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    required
                  />
                </>
              )}

              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                minLength="6"
                required
              />

              {authMessage && <p style={{ color: "red" }}>{authMessage}</p>}

              <button className="submit-btn" type="submit" disabled={authLoading}>
                {authLoading
                  ? "Please wait..."
                  : authType === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </form>

            <p style={{ marginTop: "18px", textAlign: "center" }}>
              {authType === "login" ? "Don't have an account? " : "Already have an account? "}

              <button
                type="button"
                onClick={() => {
                  setAuthType(authType === "login" ? "register" : "login");
                  setAuthMessage("");
                }}
                style={{
                  border: "none",
                  background: "none",
                  color: "#6842d9",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {authType === "login" ? "Register" : "Login"}
              </button>
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowForm(false)}>
              ✕
            </button>

            <h2>Report {reportType} Item</h2>
            <p>Enter the details of your item below.</p>

            <form onSubmit={handleSubmit}>
              <label>Item Name</label>
              <input
                type="text"
                placeholder="Enter item name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Documents</option>
                <option>Personal Items</option>
                <option>Books</option>
                <option>Other</option>
              </select>

              <label>Location</label>
              <input
                type="text"
                placeholder="Where was it lost/found?"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />

              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />

              <label>Description</label>
              <textarea
                placeholder="Describe the item..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />

              <button className="submit-btn" type="submit" disabled={reportLoading}>
                {reportLoading ? "Saving Report..." : "Submit Report"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;