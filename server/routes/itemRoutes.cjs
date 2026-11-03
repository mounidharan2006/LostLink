const express = require("express");
const Item = require("../models/Item.cjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

// Text normalization
const normalizeText = (text) => {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

// Calculate text similarity using word overlap
const calculateSimilarity = (text1, text2) => {
  const words1 = new Set(normalizeText(text1).split(" ").filter(Boolean));
  const words2 = new Set(normalizeText(text2).split(" ").filter(Boolean));

  if (words1.size === 0 || words2.size === 0) {
    return 0;
  }

  let commonWords = 0;

  words1.forEach(word => {
    if (words2.has(word)) {
      commonWords++;
    }
  });

  const totalWords = new Set([...words1, ...words2]).size;

  return commonWords / totalWords;
};

// Calculate matching score
const calculateMatchScore = (lostItem, foundItem) => {
  const nameScore =
    calculateSimilarity(lostItem.title, foundItem.title) * 40;

  const categoryScore =
    normalizeText(lostItem.category) ===
    normalizeText(foundItem.category) ? 20 : 0;

  const locationScore =
    calculateSimilarity(lostItem.location, foundItem.location) * 25;

  const descriptionScore =
    calculateSimilarity(
      lostItem.description,
      foundItem.description
    ) * 15;

  const totalScore = Math.round(
    nameScore +
    categoryScore +
    locationScore +
    descriptionScore
  );

  const reasons = [];

  if (nameScore > 0) reasons.push("Similar item name");
  if (categoryScore > 0) reasons.push("Same category");
  if (locationScore > 0) reasons.push("Similar location");
  if (descriptionScore > 0) reasons.push("Similar description");

  return {
    score: totalScore,
    reasons
  };
};

// Create lost or found item
router.post("/", authenticateUser, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      date,
      image
    } = req.body;

    if (!title || !description || !category || !type || !location || !date) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    if (!["lost", "found"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be lost or found."
      });
    }

    const item = await Item.create({
      title,
      description,
      category,
      type,
      location,
      date,
      image: image || "",
      reportedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Item reported successfully!",
      item
    });

  } catch (error) {
    console.error("Create Item Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to report item."
    });
  }
});

// Get all active lost and found items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find({
      status: "active"
    })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });

  } catch (error) {
    console.error("Get Items Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch items."
    });
  }
});

// Get only lost items
router.get("/lost", async (req, res) => {
  try {
    const items = await Item.find({
      type: "lost",
      status: "active"
    })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch lost items."
    });
  }
});

// Get only found items
router.get("/found", async (req, res) => {
  try {
    const items = await Item.find({
      type: "found",
      status: "active"
    })
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch found items."
    });
  }
});

// SMART MATCHING API
router.get("/matches", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user's active reports
    const myItems = await Item.find({
      reportedBy: userId,
      status: "active"
    });

    // Get active reports from other users
    const otherItems = await Item.find({
      reportedBy: { $ne: userId },
      status: "active"
    }).populate("reportedBy", "name email");

    const matches = [];

    for (const myItem of myItems) {
      for (const otherItem of otherItems) {

        // Only compare lost items with found items
        if (myItem.type === otherItem.type) {
          continue;
        }

        const lostItem =
          myItem.type === "lost" ? myItem : otherItem;

        const foundItem =
          myItem.type === "found" ? myItem : otherItem;

        const result = calculateMatchScore(
          lostItem,
          foundItem
        );

        // Only return possible matches
        if (result.score >= 30) {
          matches.push({
            matchScore: result.score,
            reasons: result.reasons,
            lostItem,
            foundItem
          });
        }
      }
    }

    matches.sort(
      (a, b) => b.matchScore - a.matchScore
    );

    res.json({
      success: true,
      count: matches.length,
      message:
        matches.length > 0
          ? "Possible matches found!"
          : "No possible matches found yet.",
      matches
    });

  } catch (error) {
    console.error("Smart Matching Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to find matching items."
    });
  }
});

// Get logged-in user's reports
router.get("/my-reports", authenticateUser, async (req, res) => {
  try {
    const items = await Item.find({
      reportedBy: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your reports."
    });
  }
});

// Update item status
router.patch("/:id/status", authenticateUser, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "claimed", "returned"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item status."
      });
    }

    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        reportedBy: req.user.id
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found or you are not authorized."
      });
    }

    res.json({
      success: true,
      message: "Item status updated successfully.",
      item
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update item status."
    });
  }
});

module.exports = router;