var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var badgeDataSchema = mongoose.Schema({});

var pathwaySchema = new Schema({
    title: String,
    description: String,
    longDescription: String,
    authorNotes: String,
    materials: String,
    targetAges: {},
    subjectAreas: String,
    environments: String,
    standards: [{text: String}],
    tags: [{text: String}],
    dateCreated: {type: Date, default: Date.now},
    visible: {type: Boolean, default: false},
    badge: Number,
    waypoints: [
        {
            text: String,
            content: String,
            videoURL: String,
            images: [String],
            disqus: Boolean
        }
    ]
}, {collection: 'pathways'});

module.exports = mongoose.model('pathway', pathwaySchema);