const Listing = require("./models/listing.js");
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be signed in first!");
        return res.redirect("/users/login");
    }
    next();
};

module.exports.saveredirectUrl = (req, res, next) => {
    if (req.body.redirectUrl) {
res.locals.redirectUrl = req.body.redirectUrl;
        }
        next();
    };

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

    