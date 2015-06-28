var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');

var db = require('./config/db');

var credlyRoutes = require('./routes/credly');
var pathwayRoutes = require('./routes/pathways');
var mailRoutes = require('./routes/mail');

var port = process.env.PORT || 8080;

//need to add app.use for other dependencies

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(express.static(__dirname + '/public'));

//db connection

mongoose.connect(db.url);

var badgedb = mongoose.connection;

badgedb.once('open', function (callback) {
  console.log('db connection successful');
});

//routes

var router = express.Router();

//api routes

//should use middleware for validation and auth. NEED THIS SOON (ish)

router.get('/api/pathways', pathwayRoutes.getPathways);
router.get('/api/pathway/:pathway_id', pathwayRoutes.getPathwayById);
router.post('/api/pathways', pathwayRoutes.createPathway);
router.put('/api/pathway/:pathway_id', pathwayRoutes.updatePathway);
router.post('/api/pathways/find', pathwayRoutes.queryPathways);

router.post('/api/credlybadge', credlyRoutes.createBadge);
router.put('/api/credlybadge/:badge_id', credlyRoutes.updateBadge);
router.get('/api/credlybadge/:badge_id', credlyRoutes.getBadge);
router.get('/api/credlybadgebuilder', credlyRoutes.getBadgeBuilderURL);
router.post('/api/credlybadge/claim', credlyRoutes.claimBadge);

router.post('/app/mailto', mailRoutes.mailInfoTo);

//app.use('/*', express.static(__dirname + '/public'));

//router.all('/', function(req, res, next) {
//    console.log(req.url);
//    res.sendFile(__dirname + '/public/index.html');
//});
//
//router.all('/*', function(req, res, next) {
//    console.log(req.url);
//    res.sendFile(__dirname + '/public' + req.url);
//});

app.use('/', router);

app.listen(port);

console.log('Listening... can you hear it? port ' + port);

exports = module.exports = app;