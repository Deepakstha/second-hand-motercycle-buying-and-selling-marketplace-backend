const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require('express-session');
const cors = require("cors");
const process = require("node:process");
const jwt = require("jsonwebtoken");
require("dotenv").config({
    path: "./config.env"
})
const db = require("./model/index")


const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'kjkjkjk',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

/*  Google AUTH  */

var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:8000/auth/google/callback",
        },
        function (accessToken, refreshToken, profile, done) {
            userProfile = profile;
            return done(null, userProfile);
        }
    )
);

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://127.0.0.1:5173/login",
    }),
    async function (req, res) {
        console.log(userProfile)
        const findUserByEmail = await db.googleUsers.findAll({
            where: {

                email: userProfile.emails[0].value,
            }
        });
        let token;
        if (findUserByEmail.length > 0) {
            token = findUserByEmail.id;
        } else {
            let user
            try {
                user = await db.googleUsers.create({
                    firstName: userProfile.name.givenName,
                    lastName: userProfile.name.familyName,
                    email: userProfile.emails[0].value,
                    googleId: userProfile.id,
                    role: "user"
                });
                token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                })
                console.log(user)
                console.log(token, "Inside")
            } catch (error) {
                console.log(error)
            }
        }
        console.log(token)
        // res.header("Access-Control-Allow-Credentials", true);

        // Successful authentication, redirect success.
        res.cookie("hello", token)
        res.redirect("/")
    }
);

// Routers
const userRouter = require("./router/userRouter");
const productRouter = require("./router/productsRouter");
const adminRouter = require("./router/AdminRouter");
const vehicleRouter = require("./router/vehicleFillupRoute");


const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
}

app.use(cookieParser());

// page gateway
app.use("/api/v1/user", cors(corsOptions), userRouter);
app.use("/api/v1/products", cors(corsOptions), productRouter);
app.use("/api/v1/admin", cors(corsOptions), adminRouter);  // -> super admin pannel
app.use("/vehicles", cors(corsOptions), vehicleRouter);

// server 
const server = app.listen(port, () => {
    console.log("server is running at port : ", port);
})

process.on('unhandledRejection', (err) => {
    console.log("unhandeled promise rejection");
    server.close(() => {
        process.exit(1);
    })
})
