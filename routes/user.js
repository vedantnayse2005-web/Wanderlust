const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.js');
const { saveredirectUrl } = require('../middleware.js');
const userController = require('../controler/users.js');


router.get("/signup", userController.renderSignupForm);

router.get("/login", userController.renderLoginForm);

router.post("/login", saveredirectUrl, passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true,
}),
userController.login
);

router.post("/signup", userController.signup);

router.get("/logout", userController.logout);

module.exports = router;