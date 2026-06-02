import {User} from "../models/User.js"; // Adjust path if your file is named differently
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Assuming you use bcryptjs for password hashing

// Cookie options for security
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS)
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ success: false, message: "User with this email already exists" });
        }

        // 3. Hash password (If your User model has a pre-save hook for hashing, you can skip this step and just pass the password)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword // Use raw password here if your model hashes it automatically
        });

        // 5. Remove password from the response object
        const createdUser = await User.findById(user._id).select("-password");

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: createdUser
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ success: false, message: "Server error during registration" });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // 2. Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // 3. Verify password (If your model has a method like user.matchPassword(), use that instead)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // 4. Generate JWT Token
        const accessToken = jwt.sign(
            { _id: user._id, email: user.email }, // Payload matches what your auth middleware expects
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d" }
        );

        // 5. Remove password from response
        const loggedInUser = await User.findById(user._id).select("-password");

        // 6. Send response with HTTP-only cookie
        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .json({
                success: true,
                message: "User logged in successfully",
                data: {
                    user: loggedInUser,
                    token: accessToken // Send token in body as well for frontend flexibility
                }
            });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Server error during login" });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/users/logout
// @access  Protected
export const logoutUser = async (req, res) => {
    try {
        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .json({
                success: true,
                message: "User logged out successfully"
            });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ success: false, message: "Server error during logout" });
    }
};

// @desc    Get current logged in user profile
// @route   GET /api/v1/users/profile
// @access  Protected
export const getUserProfile = async (req, res) => {
    try {
        // req.user is populated by your auth.middleware.js
        const user = await User.findById(req.user._id).select("-password");
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: user
        });
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching profile" });
    }
};