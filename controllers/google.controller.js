import { asyncHandler } from "../utilits/asyncHandler.js";
import { ApiResponse } from "../utilits/ApiResponse.js";
import { ApiError } from "../utilits/ApiError.js";
import { verifyGoogleToken } from "../services/firebase.services.js";
import { User } from "../models/User.model.js";
import { generateAccessAndRefereshTokens } from "./user.controller.js";

const googleAuthController = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new ApiError(400, "idToken is required");
    }

    // Verify the Google ID token with Firebase Admin
    const { uid, email, name } = await verifyGoogleToken(idToken);

    // Look up user by googleUid first, then by email (handles account linking)
    let user = await User.findOne({ googleUid: uid });

    if (!user) {
        user = await User.findOne({ email: email.toLowerCase() });
    }

    let isNewUser = false;

    if (!user) {
        // New user — auto-register with data from Google profile
        isNewUser = true;
        user = await User.create({
            fullName: name || email.split('@')[0],
            email: email.toLowerCase(),
            googleUid: uid,
            authProvider: 'google',
        });
    } else {
        // Existing user — link googleUid if not already linked
        if (!user.googleUid) {
            user.googleUid = uid;
            await user.save({ validateBeforeSave: false });
        }
    }

    // Issue JWT access + refresh tokens (same as existing flow)
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(isNewUser ? 201 : 200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                isNewUser ? 201 : 200,
                { user: loggedInUser, accessToken, refreshToken, isNewUser },
                isNewUser ? "Account created successfully" : "Signed in successfully"
            )
        );
});

export { googleAuthController };
