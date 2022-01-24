var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
	interests:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Interest"
		}
	]
});
		
// ensures username is unique
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);