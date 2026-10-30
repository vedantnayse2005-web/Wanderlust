
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

// 📦 ============ IMPORT REQUIRED MODULES ============
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const { randomBytes } = require('crypto');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

const sessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === 'production' && !sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required in production');
}

const sessionOptions = {
    secret: sessionSecret || randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






// 📝 ============ MIDDLEWARE ============
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride((req, res) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
    return req.query?._method;
}));

// 🎨 ============ VIEW ENGINE ============
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


// 🗄️ ============ DATABASE CONNECTION ============
const MONGODB_URI = 'mongodb://localhost:27017/wanderlust';

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
}

main().catch(err => console.log(err));


// 🚀 ============ MIDDLEWARES ============
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// 🏠 ============ ROUTES ============
app.get("/", (req, res) => {
    res.render("listings/root.ejs");
});
app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: " fakeuser@example.com",
        username: "fakeuser"
    });

    let register = await User.register(fakeUser, "helloworld");
    res.send(register);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/users", userRouter);


// 🛑 ============ ERROR HANDLING ============
app.use((req, res) => {
    res.status(404).render("error", {
        message: "Page not found"
    });
});

app.use((err, req, res, next) => {
    const { message = "Something went wrong", statusCode = 500 } = err;
    res.status(statusCode).render("error", {
        message,
        statusCode
    });
});

// 🚀 ============ START SERVER ============
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
