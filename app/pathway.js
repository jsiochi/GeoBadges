var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var badgeDataSchema = mongoose.Schema({});

var pathwaySchema = new Schema({
    title: String,
    creator: String,
    creatorEmail: String,
    purpose: String,
    description: String,
    criteria: String,
    evidenceDescription: String,
    requireEvidence: {type: Boolean, default: false},
    requireApproval: {type: Boolean, default: false},
    moreApprovers: String,
    longDescription: String, //<--DEPRECATED
    assessment: String,
    authorNotes: String, //<--DEPRECATED
    materials: String, //<--DEPRECATED
    minimumRequirements: String,
    timeToEarn: String,
    targetAges: {},
    subjectAreas: [String],
    environments: [String],
    standards: [{text: String}],
    natGeoStandards: String,
    ccLicense: String,
    tags: [{text: String}],
    tools: [{text: String}],
    research: String,
    platformPathway: String,
    coursePathway: String,
    certPathway: String,
    dateCreated: {type: Date, default: Date.now},
    visible: {type: Boolean, default: false},
    reviewable: {type: Boolean, default: false},
    featured: {type: Boolean, default: false},
    badge: Number,
    badgeImg: {type: String, default: ''},
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