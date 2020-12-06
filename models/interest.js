var mongoose = require("mongoose");
var interestSchema = new mongoose.Schema({
	vegan: String,
	italian: String,
	fast: String,
	location: String
});

module.exports = mongoose.model("Interest", interestSchema);