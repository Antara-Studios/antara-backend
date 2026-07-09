// import { auth } from '../config/firebase.js';

async function verifyFirebaseToken(idToken) {
    /*
    // Firebase verifies the OTP was correct and gives you a decoded token
    const decoded = await auth.verifyIdToken(idToken);

    // decoded.phone_number is already in E.164 format (+919876543210)
    if (!decoded.phone_number) throw new Error('No phone number in token');

    return {
        uid: decoded.uid,               // Firebase's unique user ID
        phone: decoded.phone_number,    // E.164 phone number
    };
    */
    throw new Error('Firebase token verification is disabled.');
}

async function verifyGoogleToken(idToken) {
    const decoded = await auth.verifyIdToken(idToken);
    if (!decoded.email) throw new Error('No email found in Google token');
    return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || '',
    };
}

export { verifyFirebaseToken, verifyGoogleToken };