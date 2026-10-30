const User = require('../models/user.js');

module.exports.renderSignupForm =  (req, res) => {
    res.render("users/signup.ejs");

};
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};
module.exports.signup =  async (req, res, next) => {
    try {
        const { username, email, password } = req.body.user;
        const user = await User.register(new User({ username, email }), password);
        req.login(user, (error) => {
            if (error) return next(error);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings/new");
        });
    } catch (error) {
        req.flash("error", error.message);
        res.redirect("/users/signup");
    }
};
 
module.exports.logout = (req, res,next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out.");
        res.redirect("/listings");
    });
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};