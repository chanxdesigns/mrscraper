var email = require('emailjs');

function sendMail (sub, msg, to) {
    console.log("Invoked");
    var server 	= email.server.connect({
        user:    "info@c-research.in",
        password:"$}_F8z_=sF5p",
        host:    "md-in-23.webhostbox.net",
        ssl:     true
    });

    server.send({
        text:    msg,
        from:    "Info <info@c-research.in>",
        to:      to,
        subject: sub
    }, function(err, message) { console.log(err || 'Msg Sent'); });
    // smtp.sendmail({
    //     "host"		: "md-in-23.webhostbox.net",
    //     "port"      : 465,
    //     "from"		: "info@c-research.in",
    //     "to"		: to,
    //     "auth"		: [ "info@c-research.in", "$}_F8z_=sF5p", "PLAIN" ],
    //     "content"	: {
    //         "subject"		: sub,
    //         "content-type"	: "text/html",
    //         "content"		: msg
    //     },
    //     "success"	: function () {
    //         console.log("Sent!");
    //     },
    //     "failure"	: function (err) {
    //         console.log("Error(%d): %s", err.code, err.message);
    //     }
    // })
}

module.exports = {send: sendMail};