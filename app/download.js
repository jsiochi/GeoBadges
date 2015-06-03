var fs = require('fs');
var request = require('request');

module.exports = {
    downloadFile: downloadFile
};

function downloadFile(uri, filename, callback) {
    request.head(uri, function(error, response, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};