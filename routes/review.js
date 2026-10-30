const express = require("express");


const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require('../schema.js');
const { isLoggedIn } = require('../middleware.js');
const reviewController = require('../controler/review.js');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.message;
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
//
router.delete("/:reviewId", isLoggedIn, wrapAsync( reviewController.deleteReview));

// Reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.postReview));

module.exports = router;








// /what is state?
//   >- state is a collection of data that describes an object at a certain point in time.
 //   >- it can be thought of as the current condition or status of an object. 
 //   >- changes to the state can affect the behavior and functionality of an object.