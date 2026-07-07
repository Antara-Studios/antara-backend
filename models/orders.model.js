// models/order.model.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true,
    },
    razorpayPaymentId: {
        type: String,
    },
    razorpaySignature: {
        type: String,
    },
    amount: {
        type: Number,
        required: true, // paise mein store karo (Razorpay ka convention)
    },
    currency: {
        type: String,
        default: 'INR',
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created',
    },
    receipt: {
        type: String,
    },
    templateId: {
        type: Number,
    },
    expiresAt: {
        type: Date,
    },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);