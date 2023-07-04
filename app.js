const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require('express-session');
const cors = require("cors");
const process = require("node:process");
const jwt = require("jsonwebtoken");
const statusFunc = require("./utils/statusFunc")
const bcrypt = require('bcrypt');

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
        failureRedirect: "http://127.0.0.1:3000/login",
    }),
    async function (req, res) {
        const findUserByEmail = await db.users.findAll({
            where: {

                email: userProfile.emails[0].value,
            }
        });
        let token;



        if (findUserByEmail.length > 0) {
            token = jwt.sign({ id: findUserByEmail[0].id }, process.env.JWT_SECRET, {
                expiresIn: process.env.COOKIE_EXPIRES_IN
            })
        } else {
            let user
            try {
                user = await db.users.create({
                    firstName: userProfile.name.givenName,
                    lastName: userProfile.name.familyName,
                    email: userProfile.emails[0].value,
                    password: await bcrypt.hash(userProfile.id+ Date.now(), 12), 
                    role: "user"
                });
                token = jwt.sign({ id: userProfile.id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.COOKIE_EXPIRES_IN
                })
            } catch (error) {
                console.log(error)
            }
        }
        res.cookie("jwt", token, {
            httpOnly: true
        })

        // Successful authentication, redirect success.
        res.redirect("http://localhost:3000/" + token)

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
app.use("*",(req,res)=>{
    res.status(401).json({message:"Not found"})
})


// server 
const server = app.listen(port, () => {
    console.log("server is running at port : ", port);
})

// process.on('unhandledRejection', (err) => {
//     console.log("unhandeled promise rejection");
//     server.close(() => {
//         process.exit(1);
//     })
// })
