/* Credly routes - the purpose of this module is to modularize all of the functionality relating to badges and Credly users */

var formidable = require('formidable');
var request = require('request');
var fs = require('fs');

var credlyApi = require('../config/credly').credlyApi;

var createUri = credlyApi + 'badges';
var updateUri = credlyApi + 'badges/';

var credlyToken = '';

module.exports = {
    createBadge: createBadge,
    updateBadge: updateBadge,
    getBadge: getBadge
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
        console.log(response);
        console.log(body);
        res.json(body);
    });
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
                        expires_in: 10000000 //NEED TO FIGURE OUT A MAX NUMBER
                    },
                    method: method
                }, function(error, response, body) {
                    console.log(body);
                    res.json(body);
                });
            }); 
        });
    });
}

function getAuthToken(callback) {
    if(credlyToken !== '') {
        console.log('token already set: ' + credlyToken);
        callback(credlyToken);
        return;
    }
    
    request({
        uri: credlyApi + 'authenticate',
        method: 'POST',
        headers: {
            'X-Api-Key' : process.env.CREDLY_KEY, 
            'X-Api-Secret' : process.env.CREDLY_SECRET
        },
        auth: {
            user : process.env.CREDLY_USER,
            pass : process.env.CREDLY_PASSWORD
        },
        json: true
    }, function(error, response, body) {
        console.log(body);
        credlyToken = body.data.token;
        console.log('obtained new token: ' + credlyToken);
        callback(credlyToken);
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