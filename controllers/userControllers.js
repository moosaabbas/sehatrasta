const userModel = require("../models/user")
const bcrypt = require("bcrypt")
const jwtToken = require("jsonwebtoken")

const signup = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const checkExistingUser = await userModel.findOne({ email: email })
        if (checkExistingUser) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const result = await userModel.create({
            email: email,
            password: hashPassword,
            firstName: firstName,
            lastName: lastName,
        })

        const token = jwtToken.sign({ email: result.email, id: result.id }, 'MY_SECRET_KEY')
        res.status(201).json({ user: result, token: token })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error in signup" })
    }
}

const signin = async (req, res) => {
    const { email, password } = req.body

    try {
        const isExistingUser = await userModel.findOne({ email: email })
        if (!isExistingUser) {
            return res.status(404).json({ message: 'user not found' })
        }

        const matchPassword = await bcrypt.compare(password, isExistingUser.password)
        if (!matchPassword) {
            return res.status(404).json({ message: 'invalid credentials' })
        }

        const token = jwtToken.sign({ email: isExistingUser.email, id: isExistingUser.id }, 'MY_SECRET_KEY')
        res.status(201).json({ user: isExistingUser, token: token })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error in signin" });
    }
}

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwtToken.verify(token, 'MY_SECRET_KEY');
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

const token = jwtToken.sign({ email: result.email, id: result._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = { signup, signin, authenticateUser }