import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    phoneVerifiedAt: {
        type: Date
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        select: false,
    },
    refreshToken: {
        type: String,
    },
    preferences: {
        theme: {
            type: String,
            enum: ['Light', 'Dark', 'System'],
            default: 'System'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    }
}
    , { timestamps: true }
);
// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

//Method to generate Access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            phone: this.phone,
            fullName: this.fullName,
            firebaseUid: this.firebaseUid
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

//Method to find user by phone
userSchema.statics.findOneByPhone = async function (phone) {
    return await this.findOne({ phone });
}

export const User = mongoose.model("User", userSchema);