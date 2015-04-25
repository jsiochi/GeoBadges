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

var credlyRoutes = require('./routes/credly');

var port = process.env.PORT || 8080;

//var credlyApi = require('./config/credly').credlyApi;

//var credlyToken = '';

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

router.get('/api/pathways', function(req,res) {
    pathway.find(function(err, pathways) {
        
        if(err) {
            res.send(err);
        }
        
        //console.log(pathways);
        
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


router.post('/api/credlybadge', credlyRoutes.createBadge);
router.put('/api/credlybadge/:badge_id', credlyRoutes.updateBadge);
router.get('/api/credlybadge/:badge_id', credlyRoutes.getBadge);

app.use('/', router);

app.listen(port);

console.log('Listening... can you hear it? port ' + port);

exports = module.exports = app;