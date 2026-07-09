// routes/payments.routes.js
import { Router } from 'express';
import { createOrder, verifyPayment, getPurchases } from '../controllers/razorpay.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = Router();

// POST /api/v1/payment/create-order  (protected - user must be logged in)
router.post('/create-order', verifyJWT, createOrder);

// POST /api/v1/payment/verify-payment  (protected - user must be logged in)
router.post('/verify-payment', verifyJWT, verifyPayment);

// GET /api/v1/payment/purchases  (protected - returns user's paid template purchases)
router.get('/purchases', verifyJWT, getPurchases);

export default router;