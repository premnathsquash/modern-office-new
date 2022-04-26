require("dotenv").config()

const { createTransport } = require("nodemailer");
const GOOGLE_USER = process.env.GOOGLE_USER, GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD
const transporter = createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: GOOGLE_USER,
        pass: GOOGLE_PASSWORD
    }
});
const sendMail = async (
    to = [], subject = '', text = undefined, html = undefined, attachments = []
) => {

    try {
        return await transporter.sendMail({
            from: `Hydesq <${GOOGLE_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
            attachments // attachments
        },(error, info) => {
        if (error) {
            return console.log('Error while sending mail: ' + error);
        } else {
            console.log('Message sent: %s', info.messageId);
        }
        transport.close(); // shut down the connection pool, no more messages.
    });
    } catch (error) {
        // Log
        console.error('Error in Sending Mail', error);
        // Throw the Error
        return { error } 
    }
}

module.exports = {
    sendMail
};