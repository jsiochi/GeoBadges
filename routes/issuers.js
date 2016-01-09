var request = require('request');
var issuer = require('../app/issuer');

module.exports = {
    getIssuers: getIssuers,
    addIssuer: addIssuer,
    deleteIssuer: deleteIssuer
};

function getIssuers(req, res) {
    issuer.find(function(err, issuers) {
        if(err) {
            res.send(err);
        }
        
        res.json(issuers);
    });
}

function addIssuer(req, res) {
    var issu;
    issu = new issuer({
        name: req.body.name
    });
    
    issu.save(function (err) {
        if(!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
    });
    
    return res.send(issu);
}

function deleteIssuer(req, res) {
    issuer.remove({name : req.params.name}, function(err) {
        if(err) {
            console.log(err);
        }
        
        res.json({deleted: req.params.name});
    });
};