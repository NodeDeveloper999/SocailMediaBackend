import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { username, password, bio, profilePicture } = req.body;

    console.log(req.body)
    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    // Create new userF
    const newUser = new User({
      username,
      password,
      bio,
      profilePicture,
    });

    await newUser.save();

    // Return user data (excluding password)
    const { password: pw, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({
      message: 'User created successfully.',
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    console.log(username)
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "7d" });

    // Send response without password
    const { password: pw, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      message: "Login successful.",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};