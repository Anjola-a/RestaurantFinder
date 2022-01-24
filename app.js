

//Config
'use strict';

const yelp = require('yelp-fusion');
const client = yelp.client('45fu92tdd4Ytkpg5vl_bhMM3zKnN4N1WNKlFeLG-rlM2sid9LZ9h89DJ_BU5zHAC11NxFsw9_4drAdhBfknsHKm9TMV4OUPuN3w8jATfkbjRTYIGBTzIcwmAQGSOX3Yx');
const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const methodOverride = require("method-override");
const session = require('express-session');
const mongoose=require("mongoose");
const path = require("path");
const MongoDBStore = require("connect-mongo")(session);
const User = require("./models/user");
const Interest =require("./models/interest");
const flash = require('connect-flash');
require('dotenv').config();
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/Anjola';
// ||'mongodb://localhost:27017/Anjola'
mongoose.connect(dbUrl , {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

const passport=require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");


app.use(methodOverride("_method"));
app.use(require("express-session")({
    secret: "Anjola is cool",
    resave: false,
    saveUninitialized: false
}));
const secret = process.env.SECRET || 'Iamamazing!';
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
// session gives persistent login
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

passport.use(new LocalStrategy(User.authenticate()));
// get user in and out of a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware to make current user available of every route
app.use(function(req, res, next){
	res.locals.currentUser= req.user;
	next();
	//res.locals is what is available in our templatess
});


	
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//ROUTES
const userRoutes = require('./routes/users');
const interestRoutes = require('./routes/interestRoutes');

//Shows home page

app.use('/', userRoutes);
app.use('/user', interestRoutes);


const port = process.env.PORT || 3000;
app.listen(port, function() { 
  console.log('Restaurant-Finder Server  has started'); 
});
