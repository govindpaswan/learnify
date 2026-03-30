const express = require("express");
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleBlockUser, deleteUser } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);
router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
