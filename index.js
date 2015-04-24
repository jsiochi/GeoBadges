var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var formidable = require('formidable');
//need to use request lib, but resolve naming conflict with local function-scope variables first
var request = require('request');
var fs = require('fs');

var db = require('./config/db');

var port = process.env.PORT || 8080;

var credlyApi = require('./config/credly').credlyApi;

var credlyToken = '';

//need to add app.use for other dependencies

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(express.static(__dirname + '/public'));

//db connection

var badge = require('./app/badge');
var pathway = require('./app/pathway');

mongoose.connect(db.url);

var badgedb = mongoose.connection;

badgedb.once('open', function (callback) {
  console.log('db connection successful');
});

//routes

var router = express.Router();

//api routes

//should use middleware for validation and auth. NEED THIS SOON (ish)

/* METHOD IS DEPRECATED */
router.get('/api/badges', function(req, res) {
    badge.find(function(err, badges) {
        
        if(err) {
            res.send(err);
        }
        
        res.json(badges);
    });
});

router.get('/api/pathways', function(req,res) {
    pathway.find(function(err, pathways) {
        
        if(err) {
            res.send(err);
        }
        
        console.log(pathways);
        
        res.json(pathways);
    });
});

router.get('/api/pathway/:pathway_id', function(req,res) {
    pathway.findById(req.params.pathway_id, function(err, singlePathway) {
        if(err) {
            res.send(err);
        }
        
        res.json(singlePathway);
    });
});

router.post('/api/pathways', function(req,res) {
    var path;
    console.log(req.body);
    path = new pathway({
        title: req.body.title,
        description: req.body.description,
        longDescription: req.body.longDescription,
        authorNotes: req.body.authorNotes,
        materials: req.body.materials,
        targetAges: req.body.targetAges,
        subjectAreas: req.body.subjectAreas,
        environments: req.body.environments,
        standards: req.body.standards,
        tags: req.body.tags,
        badge: req.body.badge
    });
    
    path.save(function (err) {
        if(!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
    });
    
    return res.send(path);
});

router.put('/api/pathway/:pathway_id', function(req,res) {
    pathway.findById(req.params.pathway_id, function(err, path) {
        if(err) {
            res.send(err);
        }
        
        path.waypoints = req.body.waypoints;
        path.title = req.body.title;
        path.description = req.body.description;
        path.longDescription = req.body.longDescription;
        path.authorNotes = req.body.authorNotes;
        path.materials = req.body.materials;
        path.targetAges = req.body.targetAges;
        path.subjectAreas = req.body.subjectAreas;
        path.environments = req.body.environments;
        path.standards = req.body.standards;
        path.tags = req.body.tags;
        path.badge = req.body.badge;
        
        
        path.save(function(err) {
            if(err) {
                console.log(err);
            }
            
            res.json({message: 'waypoints updated'});
        });
    });
});

//begin callback hell - also need to re configure dir it's saved in
router.post('/api/credlybadge', function(req, res) {
    getAuthToken(function(token) {
        var form = new formidable.IncomingForm();
        
        form.parse(req, function(err, field, file) {
            if(err) {
                console.error(err.message);
                return;
            }
            
            //need something that deletes images after certain period of time?
            var imgPath = '/var/folders/bd/xzbbnfg56gng6hvm6yl19j8c0000gn/T/upload_8c5c2bc9f9619db9422a05797c1ee446';
            
            //var formData = {title: 'A Cool New Badge', attachment: [fs.createReadStream(imgPath)]};
            
            //OH no, need to check if file.path is null!!
            
            fs.readFile(file.file.path, 'base64', function(err, imgData) {
                if (err) {
                    return console.log(err);
                }
                
                console.log('read the file');
                
                request({
                    uri: credlyApi + 'badges',
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
                    method: 'POST'
                }, function(error, response, body) {
                    console.log(body);
                    res.json(body);
                });
            }); 
        });
    });
});

//update a badge with new image. should refactor this - too much code duplication!!
router.put('/api/credlybadge/:badge_id', function(req, res) {
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
                    uri: credlyApi + 'badges/' + req.params.badge_id,
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
                    method: 'POST'
                }, function(error, response, body) {
                    console.log(body);
                    res.json(body);
                });
            }); 
        });
    });
});

//test API route for credly auth stuff
router.get('/api/credlyuser', function(req,res) {
    
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
    
});

//get badge information by id - should this information be saved in the DB as well? what about updating it / consistency?
router.get('/api/credlybadge/:badge_id', function(req, res) {
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
});

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
};
    

app.use('/', router);

app.listen(port);

console.log('Listening... can you hear it? port ' + port);

exports = module.exports = app;