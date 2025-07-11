
if(process.env.NODE_ENV !== "production") {
require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const methodOverride = require('method-override');
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport =  require("passport");
const LocalStrategy = require("passport-local") ;
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbURL = process.env.ATLASDB_URL ;


main().then(()=>{
    console.log("connected to DB");
}).catch(err =>{
    console.log(err);
})
async function main(){
    await mongoose.connect(dbURL);
}

app.engine('ejs', ejsmate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto : {
        secret: process.env.SECRECT ,
    },
    touchAfter: 24 * 3600, 
});

store.on("error", () => {
    console.log("Mongo session store error");
});

const sessionOptions= {
    store ,
    secret:  process.env.SECRECT,
    resave: false,
    saveUninitialized: true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge  :  7 * 24 * 60 * 60 * 1000,
        httpOnly : true ,
    },
};

// app.get("/" , (req , res)=>{
//     res.send("Hello World");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user ; 
    next();
});

// app.get("/demouser" , async(req,res)=> {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registerUser = await User.register(fakeUser , "helloworld");
//     res.send(registerUser); 
// })


app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});





app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewsRouter);
app.use("/" , userRouter);


app.all("/*path" , (req,res,next) =>{
    next(new ExpressError(404,"page not found"));
})

app.use((err,req,res,next) => {
    let {statusCode , message} = err ;
    res.render("error.ejs",{message});
    // res.status(statusCode).send(message);
    // res.send("something went wrong!")
})