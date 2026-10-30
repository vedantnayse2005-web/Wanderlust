const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema , reviewSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const { isLoggedIn } = require('../middleware.js');
const listingsController = require('../controler/listings.js');

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'wanderlust/listings',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    }),
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, callback) => {
        const cloudinaryConfig = cloudinary.config();
        if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
            return callback(new ExpressError('Configure Cloudinary credentials in .env before uploading files.', 503));
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            return callback(null, true);
        }
        callback(new ExpressError('Upload a JPG, PNG, GIF, WebP, or PDF file.', 400));
    },
});
const parseListingMedia = (req, res, next) => {
    upload.single('image')(req, res, (error) => {
        if (!error) {
            return next();
        }
        if (error instanceof multer.MulterError) {
            const isTooLarge = error.code === 'LIMIT_FILE_SIZE';
            return next(new ExpressError(
                isTooLarge ? 'The uploaded file must be 10 MB or smaller.' : 'Upload only one file.',
                isTooLarge ? 413 : 400
            ));
        }
        next(error);
    });
};

const isListingOwner = wrapAsync(async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        throw new ExpressError('You do not have permission to modify this listing.', 403);
    }
    res.locals.listing = listing;
    next();
});

// fix the middleware itself - use the synchronous .validate(), not .validateAsync()
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};


// 📋 INDEX
router.get("/", wrapAsync(listingsController.index)
);

// ➕ NEW
router.get("/new",isLoggedIn,listingsController.renderNewForm); 

// 💾 CREATE (FIXED HERE)
router.post("/", isLoggedIn, parseListingMedia, validateListing, listingsController.createListing);

// 👁️ SHOW
router.get("/:id",listingsController.showListing);

// ✏️ EDIT
router.get("/:id/edit", isLoggedIn, isListingOwner,listingsController.renderEditForm);

// 🔄 UPDATE (FIXED HERE)
router.put("/:id", isLoggedIn, isListingOwner, parseListingMedia, validateListing, listingsController.updateListing);

// 🗑️ DELETE
router.delete("/:id", isLoggedIn, isListingOwner, wrapAsync(listingsController.deleteListing));

module.exports = router;