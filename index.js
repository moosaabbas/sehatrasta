const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

mongoose.connect('mongodb+srv://admin:admin@cluster0.zaumyjt.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'MY_SECRET_KEY');
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error('Token:', token);
        console.error('Error:', error.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};

app.get('/adminLogin', adminLogin);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
  });
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


//Backend