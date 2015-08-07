var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');

var db = require('./config/db');

var credlyRoutes = require('./routes/credly');
var pathwayRoutes = require('./routes/pathways');
var mailRoutes = require('./routes/mail');

var users = [
    {id: 1, username: 'creator', password: process.env.CREATOR_PASSWORD},
    {id: 2, username: 'admin', password: process.env.ADMIN_PASSWORD}
];

//Passport setup for auth session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    if(users[id - 1]) {
        done(null, users[id-1]);
    } else {
        done(new Error('User ' + id + ' does not exist'), users[id-1]);
    }
});

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
} //<-- surely there is some function already written to do this exact thing?

passport.use(new LocalStrategy(
    function(username, password, done) {
        findByUsername(username, function(err, user) {
            if(err) {
                return done(err);
            }
            if(!user) {
                return done(null, false, {message: 'Unknown user ' + username});
            }
            if(user.password !== password) {
                return done(null, false, {message: 'Invalid password'});
            }
            return done(null, user);
        })
    }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  //res.redirect('/login');
}
//passport setup done!

var port = process.env.PORT || 8080;

//need to add app.use for other dependencies

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(passport.initialize());
app.use(passport.session());

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
router.get('/api/pathways/featured', pathwayRoutes.getFeaturedPathways);
router.get('/api/pathway/:pathway_id', pathwayRoutes.getPathwayById);
router.post('/api/pathways', pathwayRoutes.createPathway);
router.put('/api/pathway/:pathway_id', pathwayRoutes.updatePathway);
router.post('/api/pathways/find', pathwayRoutes.queryPathways);
router.delete('/api/pathway/:pathway_id', pathwayRoutes.deletePathway);

router.post('/api/credlybadge', credlyRoutes.createBadge);
router.put('/api/credlybadge/:badge_id', credlyRoutes.updateBadge);
router.get('/api/credlybadge/:badge_id', credlyRoutes.getBadge);
router.get('/api/credlybadgebuilder', credlyRoutes.getBadgeBuilderURL);
router.post('/api/credlybadge/claim', credlyRoutes.claimBadge);

router.post('/app/mailto', mailRoutes.mailInfoTo);
router.post('/app/mailmsg', mailRoutes.mailMessage);

router.post('/loginUser', 
    passport.authenticate('local'),
    function(req, res) {
        res.json({auth: true, 
                  token: crypto.createHash('sha256').update(req.body.username+':'+req.body.password).digest('hex')});
    });

router.post('/isAuthorized', function(req, res) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === req.body.username) {
            if(req.body.token === crypto.createHash('sha256').update(user.username+':'+user.password).digest('hex')) {
                if(req.body.role == undefined) {
                    res.json({auth: true});
                } else {
                    res.json({auth: req.body.role == user.username});
                }
                return;
            }
        }
    }
    res.json({auth: false});
});

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