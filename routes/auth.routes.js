import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
} from '../controllers/user.controller.js';
import phoneController from '../controllers/phone.controller.js';
import { googleAuthController } from '../controllers/google.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
// remove it in production
import { auth } from '../config/firebase.js';
const router = Router();

router.route('/refresh-token').post(refreshAccessToken);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/login').post(loginUser);
router.route('/register').post(registerUser);
router.route('/phone').post(phoneController)
router.route('/google').post(googleAuthController)
// remove it in production
router.post('/test-token', async (req, res) => {
    try {
        const { phone } = req.body;
        let userRecord;
        try {
            userRecord = await auth.getUserByPhoneNumber(phone);
        } catch {
            userRecord = await auth.createUser({ phoneNumber: phone });
        }
        const customToken = await auth.createCustomToken(userRecord.uid);
        res.json({ customToken });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;


