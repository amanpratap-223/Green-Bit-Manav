import express from "express";
import User from "../models/User.js";
const router = express.Router();

// Register (use once to create accounts; or keep for sign-up)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success:false, message:"name, email, password, role required" });
    }
    if (!["coordinator", "faculty"].includes(role)) {
      return res.status(400).json({ success:false, message:"role must be coordinator|faculty" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success:false, message:"Email already exists" });

    const user = await User.create({ name, email, password, role });
    const token = user.generateAuthToken();
    res.status(201).json({ success:true, data: { user: { id:user._id, name:user.name, email:user.email, role:user.role }, token }});
  } catch (e) {
    res.status(500).json({ success:false, message:"Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ success:false, message:"Invalid credentials" });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success:false, message:"Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();

    const token = user.generateAuthToken();
    res.json({ success:true, data: { user: { id:user._id, name:user.name, email:user.email, role:user.role }, token }});
  } catch (e) {
    res.status(500).json({ success:false, message:"Server error" });
  }
});

export default router;
