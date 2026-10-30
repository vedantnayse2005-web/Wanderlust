const Review = require("../models/review");


module.exports.postReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }

    const { review } = req.body;
    const newReview = new Review({ ...review, author: req.user._id });
    await newReview.save();
    listing.reviews.push(newReview._id);
    await listing.save();
    console.log("new review saved"); 
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    const [listing, review] = await Promise.all([
        Listing.findById(id),
        Review.findById(reviewId),
    ]);
    if (!listing || !review || !listing.reviews.some((id) => id.equals(review._id))) {
        throw new ExpressError('Review not found', 404);
    }
    const isReviewAuthor = review.author && review.author.equals(req.user._id);
    const isListingOwner = listing.owner && listing.owner.equals(req.user._id);
    if (!isReviewAuthor && !isListingOwner) {
        throw new ExpressError('You do not have permission to delete this review.', 403);
    }

    // Remove the review's ObjectId reference from the listing's reviews array
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the actual review document
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
};
