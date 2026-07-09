import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        return {
            googleId: payload['sub'],
            email: payload['email'],
            fullName: payload['name'],
            picture: payload['picture']
        };
    } catch (error) {
        throw new Error('Invalid Google token: ' + error.message);
    }
}

export { verifyGoogleToken };
