var email = require('emailjs');

function sendMail (sub, msg, to) {
    var server 	= email.server.connect({
        user:    "info@c-research.in",
        password:"i$b$@DIg$P6.",
        host:    "md-in-23.webhostbox.net",
        ssl:     true
    });

    server.send({
        text:    msg,
        from:    "Info <info@c-research.in>",
        to:      to,
        subject: sub
    }, function(err) { console.log(err || 'Msg Sent'); });
}

module.exports = {send: sendMail};