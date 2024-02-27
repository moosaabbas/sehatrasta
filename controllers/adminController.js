const jwt = require('jsonwebtoken');

const generateToken = () => {
    const payload = {
        user: 'admin@admin.com', 
    };

    return jwt.sign(payload, 'MY_SECRET_KEY');
};

const adminLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (email === 'admin@admin.com' && password === '12345678') {
        const token = generateToken();
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Authentication failed' });
    }
};



module.exports = { adminLogin };
