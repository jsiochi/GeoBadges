var nodemailer = require('nodemailer');

module.exports = {
    mailInfoTo: mailInfoTo,
    mailMessage: mailMessage
};

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'geobadges.mailer@gmail.com',
        pass: process.env.CREDLY_PASSWORD
    }
});

function mailInfoTo(req, res) {
    var mailOptions = {
        from: 'GeoBadges Signup <geobadges.mailer@gmail.com>',
        to: 'marino@mapstory.org',
        subject: 'Request for GeoBadges Info',
        text: req.body.name + ' would like to know more about GeoBadges. Please add ' + req.body.address + ' to the email list.',
        html: req.body.name + ' would like to know more about <b>GeoBadges</b>. Please add ' + req.body.address + ' to the email list.'
    };
    
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            res.json(error);
        } else {
            res.json(info);
        }
    });
}

function mailMessage(req, res) {
    var mailOptions = {
        from: 'GeoBadges Notifications <geobadges.mailer@gmail.com>',
        to: req.body.address,
        subject: req.body.subject,
        text: req.body.text,
        html: req.body.text
    };
    
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            res.json(error);
        } else {
            res.json(info);
        }
    });
}