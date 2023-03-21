require('dotenv').config()
const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});

function getState(status){
    if(status == 0) return 'thấp'
    if(status == 1) return 'báo động'
    if(status == 2) return 'cao'
}

module.exports = (status) => {
    var mailOptions = {
        from: 'nambuihung654@gmail.com',
        to: 'buihungnam123@gmail.com',
        subject: 'Thông báo nồng độ khói',
        text: `Nồng độ khói hiện đang ở mức ${getState(status)}`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

