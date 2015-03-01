var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var https = require('https');

var db = require('./config/db');

var port = process.env.PORT || 8080;

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
        
        res.json(pathways);
    });
});

router.get('/api/pathways/:pathway_id', function(req,res) {
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
        standards: req.body.standards
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

router.put('/api/pathways/:pathway_id', function(req,res) {
    pathway.findById(req.params.pathway_id, function(err, path) {
        if(err) {
            res.send(err);
        }
        
        //need to add code to update other metadata, not just waypoints
        path.waypoints = req.body.waypoints;
        
        path.save(function(err) {
            if(err) {
                res.send(err);
            }
            
            res.json({message: 'waypoints updated'});
        });
    });
});

//test API route for credly auth stuff
router.get('/api/credlyuser', function(request,result) {
    var options = {
        host: 'api.credly.com',
        path: '/v1.1/authenticate',
        headers: {
            'X-Api-Key' : process.env.CREDLY_KEY, 
            'X-Api-Secret' : process.env.CREDLY_SECRET
        },
        auth: process.env.CREDLY_USER + ':' + process.env.CREDLY_PASSWORD,
        method: 'POST'
    };
    
    var req = https.get(options, function(res) {
        var output = '';
        
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        
        res.on('data', function(chunk) {
            output += chunk;
        });
        
        res.on('end', function() {
            var obj = JSON.parse(output);
            console.log(obj);
            result.send('HELLO');
        });
        
        
    });
    
    req.on('error', function(err) {
            
    });
    
    req.end();
});

var getWithAuthToken = function() {
    
};
    

app.use('/', router);

app.listen(port);

console.log('Listening... can you hear it? port ' + port);

exports = module.exports = app;