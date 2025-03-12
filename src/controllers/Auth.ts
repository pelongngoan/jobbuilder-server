import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../database/models/User";
import nodemailer from "nodemailer";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create user
    const newUser = new User({ name, email, password: password, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// **Login User**
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("second");
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    // Check password
    const isMatch = await user.comparePassword(password);
    console.log("Password Match:", isMatch);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate verification code
    const verificationCode = crypto.randomBytes(20).toString("hex");
    user.verificationCode = verificationCode;
    await user.save();

    const verificationLink = `http://localhost:3000/api/auth/verify-email?code=${verificationCode}&email=${email}`;

    // Send Email
    await transporter.sendMail({
      to: email,
      subject: "Verify Your Account",
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your account.</p>`,
    });

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.query;

  try {
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
