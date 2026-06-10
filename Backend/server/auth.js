const jwt = require('jsonwebtoken');

function getSecret() {
    const s = process.env.JWT_SECRET;
    if (!s) {
        console.warn('[auth] JWT_SECRET nie jest ustawiony — używany jest domyślny sekret tylko do rozwoju.');
        return 'farm-dev-secret-change-me';
    }
    return s;
}

function signToken(payload) {
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    return jwt.sign(payload, getSecret(), { expiresIn });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Brak tokenu uwierzytelniającego' });
    }
    jwt.verify(token, getSecret(), (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token nieważny lub wygasły' });
        }
        req.user = user;
        next();
    });
}

module.exports = { signToken, authenticateToken };
