import { asyncHandler } from "../utilits/asyncHandler.js";
import { ApiResponse } from "../utilits/ApiResponse.js";
import { ApiError } from "../utilits/ApiError.js";
// import { verifyFirebaseToken } from "../services/firebase.services.js";
import { User } from "../models/User.model.js";

const phoneController = asyncHandler(async (req, res) => {
    /*
    const { idToken } = req.body;
    if (!idToken) throw new ApiError(400, "idToken is required");

    const { uid, phone } = await verifyFirebaseToken(idToken);

    let user = await User.findOne({ phone });

    // User must register first via /register
    if (!user) {
        throw new ApiError(404, "User not found. Please register first.");
    }

    // Link Firebase UID and mark phone as verified
    if (!user.phoneVerified) {
        user.phoneVerified = true;
        user.phoneVerifiedAt = new Date();
        user.firebaseUid = uid;
        await user.save({ validateBeforeSave: false });
    }

    res.json(new ApiResponse(200, {
        userId: user._id,
        phoneVerified: user.phoneVerified,
    }, "Phone verified successfully"));
    */
    throw new ApiError(403, "OTP mobile login is disabled. Please use Google Login.");
});
export default phoneController;
