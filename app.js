// Blog translates to user interests

//Config
'use strict';

const yelp = require('yelp-fusion');
const client = yelp.client('45fu92tdd4Ytkpg5vl_bhMM3zKnN4N1WNKlFeLG-rlM2sid9LZ9h89DJ_BU5zHAC11NxFsw9_4drAdhBfknsHKm9TMV4OUPuN3w8jATfkbjRTYIGBTzIcwmAQGSOX3Yx');
var express = require("express");
var app = express();
var bodyParser=require("body-parser");
var methodOverride = require("method-override");
const session = require('express-session');
var mongoose=require("mongoose");
var path = require("path");
const MongoDBStore = require("connect-mongo")(session);
require('dotenv').config();
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/Anjola';
// ||'mongodb://localhost:27017/Anjola'
mongoose.connect(dbUrl , {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

	 var passport=require("passport"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	 Interest =require("./models/interest"),
	 User=require("./models/user");
app.use(methodOverride("_method"));
app.use(require("express-session")({
    secret: "Anjola is cool",
    resave: false,
    saveUninitialized: false
}));
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

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

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware to make current user available of every route
app.use(function(req, res, next){
	res.locals.currentUser= req.user;
	next();
	//res.locals is what is available in our templatess
});

// MONGOOSE MODEL CONFIG
// var interestSchema = new mongoose.Schema({
// 	arts: String,
// 	sports: String,
// 	volunteering: String
// });
	
// var Interest = mongoose.model("Interest", interestSchema);
	
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));


//ROUTES

//Shows home page
app.get("/", function(req, res){
	// req.user username and id of currrent user
	
	res.render("home", {currentUser: req.user})
});


// show register form
app.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
//also prevents user from signing up with a user that already exists
//Then redirects to interests form
app.post("/register", function(req, res){
	//register the newUser, regster will store an hash of the password
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/user/" + user._id +"/interests/new"); 
        });
    });
});

// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect:"/" ,
        failureRedirect: "/login"
    }), function(req, res){
	
	
});


//The users customized page, with all their events based on their interests

app.get("/user/:id",  isLoggedIn ,function(req, res){
    //find the user with provided ID
	var arr1 = [];
    User.findById(req.params.id).populate("interests").exec(function(err, foundUser){
        if(err){
            console.log(err);
        } else {
			
           
			console.log(foundUser.interests[0]);
			// console.log(foundUser.interests[0].location);
			
			if (foundUser.interests[0].fast){
				var fast = client.search({
					term: foundUser.interests[0].fast,
				  	location: foundUser.interests[0].location,
					limit: 5,
				});
				arr1.push(fast);
				}
			else if (foundUser.interests[0].vegan){
				var vegan = client.search({
				  term: foundUser.interests[0].vegan,
				  location: foundUser.interests[0].location,
					limit: 3,
				})
				arr1.push(vegan);
			}
			
			else if (foundUser.interests[0].italian){
				var italian = client.search({
				  term: foundUser.interests[0].italian,
				  location: foundUser.interests[0].location,
					limit: 3,
					
				})
				arr1.push(italian);
				} 
			Promise.all(arr1).then(values => {
				console.log(arr1);
				console.log(values.length);
				
			res.render("page", {user: foundUser, values: values} );
			
			})

            //render the persons profile with their interests
            
			
        }
    });
});





// show user form for selecting what they like
//need the id of the user
 app.get("/user/:id/interests/new", isLoggedIn , function(req, res){
	 User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err);
        } else {
             res.render("intrests", {user: user});
        }
    })
 });

app.post("/user/:id/interests", isLoggedIn, function(req, res){
	
	User.findById(req.params.id, function(err, user){
       if(err){
           console.log(err);
           res.redirect("/");
       } else {
        Interest.create(req.body.intrest, function(err, interest){
           if(err){
               console.log(err);
           } else {
               user.interests.push(interest);
               user.save();
               res.redirect('/user/' + user._id);
           }
        });
       }
   });
	

	// get api data and then display interest
})

//EDIT ROUTe
app.get("/user/:id/interests/edit", isLoggedIn, function(req, res){
	User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err);
        } else {
             res.render("edit", {user: user});
        }
    })
 });

// app.get("/user/:id/interests/edit", isLoggedIn, function(req, res){
// 	User.findById(req.params.id).populate("interests").exec(function(err, foundUser){
//         if(err){
//             console.log(err);
//         } else {
           
			
//             //render the persons profile with their interests
//             res.render("edit", {user: foundUser});
//         }
//     });
//  });


//update edited information
app.put("/user/:id/interests",isLoggedIn, function(req, res){
	User.findById(req.params.id, function(err, user){
       if(err){
           console.log(err);
           res.redirect("/");
       } else {
		var finds = {
			_id: req.user.interests[0]
		}
        Interest.findOneAndReplace(finds, req.body.intrest, {new: true}, function(err, updatedinterest){
			console.log("this is " + req.body.updatedinterest)
           if(err){
               console.log(err);
           } else {
			   user.save();
			   // console.log(updatedinterest)
               res.redirect('/user/' + user._id);
           }
        });
       }
	});
});



//====
//Authentication


// logic route
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/");
});



//show user route





function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
const port = process.env.PORT || 3000;
app.listen(port, function() { 
  console.log('YelpCamp Server  has started'); 
});
