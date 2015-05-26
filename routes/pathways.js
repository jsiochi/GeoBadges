var request = require('request');
var pathway = require('../app/pathway');

module.exports = {
    getPathways: getPathways,
    getPathwayById: getPathwayById,
    createPathway: createPathway,
    updatePathway: updatePathway,
    queryPathways: queryPathways
};

function getPathways(req, res) {
    pathway.find(function(err, pathways) {
        
        if(err) {
            res.send(err);
        }
        
        //console.log(pathways);
        
        res.json(pathways);
    });
}

function getPathwayById(req, res) {
    pathway.findById(req.params.pathway_id, function(err, singlePathway) {
        if(err) {
            res.send(err);
        }
        
        res.json(singlePathway);
    });
}

function createPathway(req, res) {
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
        badge: req.body.badge,
        badgeImg: req.body.badgeImg
    });
    
    path.save(function (err) {
        if(!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
    });
    
    return res.send(path);
}

function updatePathway(req, res) {
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
        path.badgeImg = req.body.badgeImg;
        
        
        path.save(function(err) {
            if(err) {
                console.log(err);
            }
            
            res.json({message: 'waypoints updated'});
        });
    });
}

function queryPathways(req, res) {
    pathway.find(req.body, function(err, docs) {
        if(err) {
            console.log(err);
        }
        
        res.json(docs);
    });
}