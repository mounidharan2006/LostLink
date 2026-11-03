import React, { useState } from "react";

function ItemForm({ type = "lost", token, onItemCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    image: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError(false);

    if (!token) {
      setMessage("Please login before reporting an item.");
      setError(true);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          type
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to report item.");
      }

      setMessage("Item reported successfully!");
      
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        date: "",
        image: ""
      });

      if (onItemCreated) {
        onItemCreated(data.item);
      }

    } catch (err) {
      setMessage(err.message || "Something went wrong.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="item-form-container">
      <h2>
        {type === "lost" ? "Report Lost Item" : "Report Found Item"}
      </h2>

      <form onSubmit={handleSubmit} className="item-form">

        <label>Item Name</label>
        <input
          type="text"
          name="title"
          placeholder="Enter item name"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Describe the item"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Electronics">Electronics</option>
          <option value="Documents">Documents</option>
          <option value="Personal Belongings">Personal Belongings</option>
          <option value="Books">Books</option>
          <option value="Accessories">Accessories</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </select>

        <label>Location</label>
        <input
          type="text"
          name="location"
          placeholder="Where was it lost or found?"
          value={formData.location}
          onChange={handleChange}
          required
        />

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label>Image URL (Optional)</label>
        <input
          type="url"
          name="image"
          placeholder="Paste image URL"
          value={formData.image}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Submitting..."
            : type === "lost"
            ? "Report Lost Item"
            : "Report Found Item"}
        </button>

        {message && (
          <p style={{ color: error ? "red" : "green" }}>
            {message}
          </p>
        )}

      </form>
    </div>
  );
}

export default ItemForm;