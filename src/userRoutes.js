const express = require("express")
const { signin, signup, authenticateUser } = require("../controllers/userControllers")
const userRoutes = express.Router()

userRoutes.post('/signup', signup)
userRoutes.post('/signin',signin)



module.exports = userRoutes;