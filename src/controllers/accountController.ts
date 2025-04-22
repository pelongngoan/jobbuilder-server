import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Account } from "../database/models/Account";

dotenv.config();

// 🔹 Generate JWT Token
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

// 🔹 Signup Controller
export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    // Check if Account already exists

    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }
    // Create new Account
    const newAccount = new Account({
      email,
      password,
      isVerified: false,
      role,
    });
    await newAccount.save();
    res.status(201).json({ message: "Account registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔹 Login Controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    // Find Account by email
    const account = await Account.findOne({ email });
    if (!Account) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    // Generate token
    const token = generateToken(account._id.toString(), account.role);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
