// controllers/razorpay.controller.js
import razorpay from '../services/razorpay.instance.js';
import { createHmac } from 'crypto';
import { Order } from '../models/orders.model.js';

// Create a Razorpay order
const createOrder = async (req, res) => {
    try {
        const { amount, templateId } = req.body;
        const userId = req.user._id; // set by verifyJWT middleware

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, error: 'A valid amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert rupees to paise (integer)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Save order record in DB
        await Order.create({
            user: userId,
            razorpayOrderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: 'created',
            templateId: templateId || null,
        });

        return res.status(201).json({ success: true, order });
    } catch (err) {
        console.error('Razorpay createOrder error:', err);
        return res.status(500).json({ success: false, error: 'Order creation failed' });
    }
};

// Verify the Razorpay payment signature
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing required payment fields' });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
            await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id, user: req.user._id },
                {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'paid',
                    expiresAt,
                }
            );
            return res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            await Order.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id, user: req.user._id },
                { status: 'failed' }
            );
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        console.error('Razorpay verifyPayment error:', err);
        return res.status(500).json({ success: false, error: 'Payment verification failed' });
    }
};

// Get all paid purchases for the current user
const getPurchases = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({
            user: userId,
            status: 'paid',
            templateId: { $ne: null },
        })
        .select('templateId amount purchasedAt expiresAt razorpayOrderId createdAt')
        .sort({ createdAt: -1 });

        const purchases = orders.map((order) => ({
            templateId: order.templateId,
            amount: order.amount,
            purchasedAt: order.createdAt,
            expiresAt: order.expiresAt,
            razorpayOrderId: order.razorpayOrderId,
        }));

        return res.status(200).json({ success: true, data: purchases });
    } catch (err) {
        console.error('getPurchases error:', err);
        return res.status(500).json({ success: false, error: 'Failed to fetch purchases' });
    }
};

export { createOrder, verifyPayment, getPurchases };