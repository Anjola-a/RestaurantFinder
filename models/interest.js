var mongoose = require("mongoose");
var interestSchema = new mongoose.Schema({
	vegan: String,
	italian: String,
	fast: String,
	location: String
});
// takes the nsme, and makes a collection called Interests
module.exports = mongoose.model("Interest", interestSchema);