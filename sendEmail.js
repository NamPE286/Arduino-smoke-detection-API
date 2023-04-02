require('dotenv').config()
const nodemailer = require('nodemailer')
const pb = require('./pocketbase')

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

function getState(status) {
    if (status == 0) return 'thấp'
    if (status == 1) return 'báo động'
    if (status == 2) return 'cao'
}

module.exports = async (status) => {
    fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: `Nguy cơ cháy nổ hiện đang ở mức ${getState(status)}`
        })
    })
    const emailList = await pb.collection('emails').getList(1, 50000)
    for (const i of emailList.items) {
        console.log(`Sending email to ${i.email}...`)
        var mailOptions = {
            from: 'nambuihung654@gmail.com',
            to: i.email,
            subject: 'Thông báo nguy cơ cháy nổ',
            text: `Nguy cơ cháy nổ hiện đang ở mức ${getState(status)}`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    return

}

