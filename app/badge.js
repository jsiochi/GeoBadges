var mongoose = require('mongoose');

var badgeSchema = mongoose.Schema({
    title : String,
	subTitle : String,
	description : String,
	grade : Number,
	standard : String,
	videoUrl : String,
	creator : String,
	projectType : String,
	discipline : String,
	tool : String,
	assessment : String
}, {collection: 'badgedata'});

module.exports = mongoose.model('badge', badgeSchema);