/* Credly routes - the purpose of this module is to modularize all of the functionality relating to badges and Credly users */

var formidable = require('formidable');
var request = require('request');
//require('request-debug')(request);
var fs = require('fs');

var credlyApi = require('../config/credly').credlyApi;
var badgeBuilderUri = require('../config/credly').badgeBuilder;

var createUri = credlyApi + 'badges';
var updateUri = credlyApi + 'badges/';

var credlyToken = '';

module.exports = {
    createBadge: createBadge,
    updateBadge: updateBadge,
    getBadge: getBadge,
    getBadgeBuilderURL: getBadgeBuilderURL,
    claimBadge: claimBadge
};

/* External API Calls to Credly system */

function createBadge(req, res) {
    badgeRequest(createUri, 'POST', req, res);
}

function updateBadge(req, res) {
    badgeRequest(updateUri + req.params.badge_id, 'POST', req, res);
}

//get badge information by id - should this information be saved in the DB as well? what about updating it / consistency?
function getBadge(req, res) {
    request({
        uri: credlyApi + 'badges/' + req.params.badge_id,
        method: 'GET',
        headers: {
            'X-Api-Key' : process.env.CREDLY_KEY, 
            'X-Api-Secret' : process.env.CREDLY_SECRET
        },
        json: true
    }, function(error, response, body) {
        //console.log(response);
        //console.log(body);
        res.json(body);
    });
}

function getBadgeBuilderURL(req, res) {
    getAuthToken(function(token) {
        request({
            uri: badgeBuilderUri,
            method: 'POST',
            form: {
                access_token: token
            },
            headers: {
                'X-Api-Key' : process.env.CREDLY_KEY, 
                'X-Api-Secret' : process.env.CREDLY_SECRET
            },
            json: true
        }, function(error, response, body) {
            //console.log(response);
            //console.log(body);
            res.json({badgeBuilderRef: 'https://credly.com/badge-builder/embed/' + body.temp_token});
        });
    });
}

function claimBadge(req, res) {
    getAuthToken(function(token) {
        console.log(req.body.evidence);
        request({
            uri: credlyApi + 'me/claimable_badges/create',
            method: 'POST',
            qs: {
                access_token: token
            },
            form: {
                badge_id: req.body.badge_id
            },
            headers: {
                'X-Api-Key' : process.env.CREDLY_KEY, 
                'X-Api-Secret' : process.env.CREDLY_SECRET
            },
            json: true
        }, function(error, response, body) {
            //console.log(response);
            //console.log(body);
            if(body.data == undefined || body.data == null) {
                console.log('BAD!');
                res.writeHead(401);
                res.end();
            } else {
                completeClaim(body.data.id, body.data.badge_id, body.data.code, req.body.username, req.body.password, req.body.evidence, function(result) {
                    res.json(result);
                });
            }
        });
    });
}

/* Helper function for credit claiming */
function completeClaim(id, badgeId, code, user, pass, evidence, callback) {
    var onAuth = function(token) {
        request({
            uri: credlyApi + 'me/claimable_badges/claim/' + badgeId,
            method: 'POST',
            qs: {
                access_token: token
            },
            form: {
                id: id,
                code: code,
                evidences: [{file: evidence}]
            },
            headers: {
                'X-Api-Key' : process.env.CREDLY_KEY, 
                'X-Api-Secret' : process.env.CREDLY_SECRET
            },
            json: true
        }, function(error, response, body) {
            console.log(body);
            callback(body);
        });
    };
    
    getAuthToken(onAuth, user, pass);
}

/* Functions not exposed */

//Possibly need to reconfigure saving directory
function badgeRequest(uri, method, req, res) {
    getAuthToken(function(token) {
        var form = new formidable.IncomingForm();
        
        form.parse(req, function(err, field, file) {
            if(err) {
                console.error(err.message);
                return;
            }
            
            //OH no, need to check if file.path is null!!
            
            fs.readFile(file.file.path, 'base64', function(err, imgData) {
                if (err) {
                    return console.log(err);
                }
                
                console.log('read the file');
                
                request({
                    uri: uri,
                    qs: {
                        access_token: token
                    },
                    headers: {
                        'X-Api-Key' : process.env.CREDLY_KEY, 
                        'X-Api-Secret' : process.env.CREDLY_SECRET
                    },
                    form: {
                        title: field.title,
                        attachment: imgData,
                        short_description: field.short_description,
                        description: field.description,
                        categories: field.tags,
                        is_claimable: 1,
                        require_claim_code: 1,
                        require_claim_evidence: field.require_evidence,
                        approve_claim_automatically: field.require_approval,
                        require_claim_evidence_description: field.require_claim_evidence_description,
                        expires_in: 10000000 //NEED TO FIGURE OUT A MAX NUMBER
                    },
                    method: method
                }, function(error, response, body) {
                    //console.log(body);
                    res.json(body);
                });
            }); 
        });
    });
}

function getAuthToken(callback, username, password) {
    var user = process.env.CREDLY_USER;
    var pass = process.env.CREDLY_PASSWORD;
    var learner = false;
    
    if(credlyToken !== '' && username === undefined && password === undefined) {
        console.log('token already set: ' + credlyToken);
        callback(credlyToken);
        return;
    } else if(username !== undefined && password !== undefined) {
        user = username;
        pass = password;
        learner = true;
    }
    
    request({
        uri: credlyApi + 'authenticate',
        method: 'POST',
        headers: {
            'X-Api-Key' : process.env.CREDLY_KEY, 
            'X-Api-Secret' : process.env.CREDLY_SECRET
        },
        auth: {
            user : user,
            pass : pass
        },
        json: true
    }, function(error, response, body) {
        //console.log(body);
        if(!learner) {
            credlyToken = body.data.token;
            console.log('obtained new token: ' + credlyToken);
        }
        
        if(body.data == undefined || body.data == null) {
            callback('');
        } else {
            callback(body.data.token); 
        }
    });
}

//test API route for credly auth stuff - is this still needed?
/*router.get('/api/credlyuser', function(req,res) {
    
    getAuthToken(function(token) {
        request({
            uri: credlyApi + 'me',
            qs: {
                access_token: token
            },
            headers: {
            'X-Api-Key' : process.env.CREDLY_KEY, 
            'X-Api-Secret' : process.env.CREDLY_SECRET
            },
            method: 'GET',
            json: true
        }, function(error, response, body) {
            console.log(body);
            res.json(body);
        });
    });
    
});*/

/*Object {meta: Object, data: Object}data: Objectbadge_id: 42871claimed: 0code: "8BF-34C6-B77"evidence: Array[1]expires_at: ""id: 5235is_deleted: falseissuer_id: 2047060limit: nulltestimonial: Array[0]__proto__: Objectmeta: Objectmessage: ""more_info: nullstatus: "OK"status_code: 200token_owner: 2047060__proto__: Object__proto__: Object*/