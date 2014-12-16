var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var port = process.env.PORT || 8080;

//need to add app.use for other dependencies

app.use(express.static(__dirname + '/public'));

var router = express.Router();

router.get('/hi', function(req, res) {
    res.send('HI PAGE');
});

app.use('/', router);

app.listen(port);

console.log('Listening... can you hear it? port ' + port);

exports = module.exports = app;