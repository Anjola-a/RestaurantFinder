
const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require("../models/user");
const yelp = require('yelp-fusion');
const client = yelp.client('45fu92tdd4Ytkpg5vl_bhMM3zKnN4N1WNKlFeLG-rlM2sid9LZ9h89DJ_BU5zHAC11NxFsw9_4drAdhBfknsHKm9TMV4OUPuN3w8jATfkbjRTYIGBTzIcwmAQGSOX3Yx');
const Interest =require("../models/interest");
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("./login");
}


router.get("/:id",  isLoggedIn ,function(req, res){
    //find the user with provided ID
	var arr1 = [];
    User.findById(req.params.id).populate("interests").exec(function(err, foundUser){
        if(err){
            console.log(err);
        } else {
			
           
			// console.log(foundUser.interests[0]);
			// console.log(foundUser.interests[0].location);
			
			if (foundUser.interests[0].fast){
				var fast = client.search({
					term: foundUser.interests[0].fast,
				  	location: foundUser.interests[0].location,
					limit: 5,
				});
				arr1.push(fast);
				}
			if (foundUser.interests[0].vegan){
				var vegan = client.search({
				  term: foundUser.interests[0].vegan,
				  location: foundUser.interests[0].location,
					limit: 5,
				})
				arr1.push(vegan);
			}
			
			if (foundUser.interests[0].italian){
				var italian = client.search({
				  term: foundUser.interests[0].italian,
				  location: foundUser.interests[0].location,
					limit: 5,
					
				})
				arr1.push(italian);
				} 
			Promise.all(arr1)
            .then(values => {
				// console.log("arri"+arr1.length);
				//console.log(values);
				
			res.render("page", {user: foundUser, values: values} );
			
			})

            //render the persons profile with their interests
            
			
        }
    });
});


// show user form for selecting what they like
//need the id of the user
 router.get("/:id/interests/new", isLoggedIn , function(req, res){
	 User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err);
        } else {
             res.render("intrests", {user: user});
        }
    })
 });

router.post("/:id/interests", isLoggedIn, function(req, res){
	
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
router.get("/:id/interests/edit", isLoggedIn, function(req, res){
	User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err);
        } else {
             res.render("edit", {user: user});
        }
    })
 });

 //update edited information
router.put("/:id/interests",isLoggedIn, function(req, res){
	User.findById(req.params.id, function(err, user){
       if(err){
           console.log(err);
           res.redirect("/");
       } else {
		var finds = {
			_id: req.user.interests[0]
		}
        Interest.findOneAndReplace(finds, req.body.intrest, {new: true}, function(err, updatedinterest){
			// console.log("this is " + req.body.updatedinterest)
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




 module.exports = router;