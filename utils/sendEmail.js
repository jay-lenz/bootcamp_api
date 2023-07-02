const nodemailer = require('nodemailer')


const sendEmail = async (options) => {

    const transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASSWORD
        }
    });
    const message = {
        from: `${process.env.FROM_NAME} < ${process.env.FROM} >`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    // var transport = nodemailer.createTransport({
    //     host: "smtp.mailtrap.io",
    //     port: 2525,
    //     auth: {
    //         user: "",
    //         pass: ""
    //     }
    // });
    const info = await transport.sendMail(message)
    console.log(`Messgae sent : %s`, info.messageId)
}

module.exports = sendEmail