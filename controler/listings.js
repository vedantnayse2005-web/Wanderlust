const Listing = require("../models/listing");

function normalizeListing(body = {}, file) {
    const source = body.listing || body;
    const imageValue = source.image?.url ?? source.image ?? "";
    const uploadedImage = file ? {
        filename: file.filename || source.image?.filename || "listingimage",
        url: file.secure_url || file.path || imageValue,
        contentType: file.mimetype || source.image?.contentType,
    } : null;

    return {
        title: source.title,
        description: source.description,
        image: uploadedImage || {
            filename: source.image?.filename || "listingimage",
            url: imageValue,
            contentType: source.image?.contentType,
        },
        price: source.price,
        location: source.location,
        country: source.country,
    };
}

module.exports.index =async (req, res) => {
    const allListings = await Listing.find({}).populate("owner");
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create a new listing.");
        return res.redirect("/users/signup");
    }
    res.render("listings/new.ejs");
};

    module.exports.createListing =  (async (req, res) => {
        const newListing = new Listing(normalizeListing(req.body, req.file));
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success", "New listing created!");
        // Redirect to the new listing page
        res.redirect("/listings");
    });

    module.exports.showListing =  (async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate("owner")
            .populate({ path: "reviews", populate: { path: "author" } });
        if (!listing) {
            throw new ExpressError('Listing not found', 404);
        }
        res.render("listings/show.ejs", { listing });
    });

    module.exports.renderEditForm =  (req, res) => {
    res.render("listings/edit.ejs", { listing: res.locals.listing });
};

    module.exports.updateListing = (async (req, res) => {
        let { id } = req.params;
    
        const listing = await Listing.findByIdAndUpdate(id, normalizeListing(req.body, req.file));
        if (!listing) {
            throw new ExpressError('Listing not found', 404);
        }
        res.redirect(`/listings/${id}`);
    });

module.exports.deleteListing = (async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }
    res.redirect("/listings");
});