import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { User } from "../models/index.js";

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, role } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing)
    return res.status(400).json({ message: "Email already in use" });

  const user = await User.create({
    ...req.body,
    role: role || "cliente",
  });
  return res.status(201).json({ ...user });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
  return res.json({ token });
}

export { register, login };
