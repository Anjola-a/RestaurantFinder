const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require("../models/user");
const flash = require('connect-flash');
router.get("/", function(req, res){
	// req.user username and id of currrent user
	res.render("home", {currentUser: req.user})
});
router.get("/register", function(req, res){
    res.render("register"); 
 });
 
 //handle sign up logic
 //also prevents user from signing up with a user that already exists
 //Then redirects to interests form
 router.post("/register", function(req, res){
     //register the newUser, regster will store an hash of the password
     var newUser = new User({username: req.body.username});
     User.register(newUser, req.body.password, function(err, user){
         if(err){
             console.log(err);
             req.flash('success', 'welcome back!');
             return res.render("register");
         }
         passport.authenticate("local")(req, res, function(){
            res.redirect("/user/" + user._id +"/interests/new"); 
         });
     });
 });
 
 // show login form
 router.get("/login", function(req, res){
    res.render("login"); 
 });
 // handling login logic
 router.post("/login", passport.authenticate("local", 
     {
         successRedirect:"/" ,
         failureRedirect: "/login",
         failureFlash: true
     }), function(req, res){
        req.flash('success', 'welcome back!');
     
     
 });
 
 router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
 });
 
 //The users customized page, with all their restaurants based on their interests
 
module.exports = router;
