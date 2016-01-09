var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var issuerSchema = new Schema({
    name: String
}, {collection: 'issuers'});

module.exports = mongoose.model('issuer', issuerSchema);