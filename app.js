const express = require('express');
var bodyParser = require('body-parser')
const { exec } = require("child_process");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const app = express();
// get config vars
dotenv.config();

async function sendMail(email, resetLink){
    let transporter = nodemailer.createTransport({
        host: process.env.DOMAIN,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SENDER, // generated ethereal user
          pass: process.env.PASSWORD, // generated ethereal password
        },
      });
    // send mail with defined transport object
    await transporter.sendMail({
        from: '"docker-mailserver password reset" <'+process.env.SENDER+'>', // sender address
        to: email, // list of receivers
        subject: "Password reset", // Subject line
        text: "Hello, click this link to reset your password: " + resetLink + ". The link expires in 5 minutes.", // plain text body
        html: `<p>Hello, click <a href='${resetLink}'>here</a> to reset your password.<br>The link expires in 5 minutes.</p>`, // html body
    }, function(error, info){
        if(error){
            console.log('[' + new Date().toUTCString() + '] '+error);
            return false;
        }
        else{
            console.log('[' + new Date().toUTCString() + '] '+"Message sent: %s", info.messageId);
            console.log('[' + new Date().toUTCString() + '] '+"Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return true;
        }
    });
}

var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.static(__dirname + '/public'));

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '300s' });
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pass_reset.html');
});

app.get('/reset', (req, res) => {
    try {
        //check for email and hash in query parameter
        if (req.query && req.query.email && req.query.hash) {
            if(req.query.email.substring(0, req.query.email.length-1) != jwt.decode(req.query.hash, process.env.TOKEN_SECRET).username){
                console.log('[' + new Date().toUTCString() + '] email does not match token');
                return res.status(403).send("<h4 style='text-align:center'>Forbidden: Could not verify token</h4>");
            }
            
            jwt.verify(req.query.hash, process.env.TOKEN_SECRET, function(err){
                if (err){
                    console.log('[' + new Date().toUTCString() + '] '+err);
                    return res.status(403).send("<h4 style='text-align:center'>Forbidden: The link has expired</h4>");
                }
              });
              console.log('[' + new Date().toUTCString() + '] Token verified');
        } else {
            //if there are no query parameters, serve the normal request form
            return res.sendFile(__dirname + '/pass_reset.html');
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
    res.sendFile(__dirname + '/reset.html');
});

//This executes the ./setup.sh script to change password of given user
//./setup.sh email update [email] [password]
app.post('/reset', urlencodedParser, (req, res) => {
    console.log(req.body);
    console.log('[' + new Date().toUTCString() + '] '+"Changing password of user", req.body.email);
    exec("../setup.sh email update " + req.body.email + " " + req.body.password, function(err,stdout,stderr){
        console.log(stderr);
        if(stderr != ""){
            res.status(400).send("<h4 style='text-align:center; font-weight: bold; color: #e8e6e3;'>Error while changing password<br><button class='btn btn-primary' ' onClick='window.location.reload();'>Refresh Page</button></h4>");
            console.log('[' + new Date().toUTCString() + '] '+"Error while changing password of user", req.body.email);
        }
        else{
            res.status(200).send("<h4 style='text-align:center; font-weight: bold; color: #e8e6e3;'>Your password has been changed successfully</h4>");
            console.log('[' + new Date().toUTCString() + '] '+"Password of user", req.body.email, "changed.");
        }
    });
});

//Password reset Link generation
app.post('/pass_reset', urlencodedParser, (req, res) => {
    console.log('[' + new Date().toUTCString() + '] email: '+req.body.email);
    try{
        if(!req.body.email.includes(process.env.DOMAIN)){
            console.log('[' + new Date().toUTCString() + '] Invalid domain address');
            return res.status(500).send("<h4 style='text-align:center'>Please insert a valid email address</h4>");
        }
        
        //generate hash
        const token = generateAccessToken({username: req.body.email});

        //generate a password reset link
        const resetLink = `${process.env.URL}/reset?email=${req.body.email}?&hash=${token}`

        //Send a mail with the link
        let result = sendMail(req.body.email, resetLink);
        if(result)
            return res.status(200).send("<h4 style='text-align:center'>If the email address provided exists, you should receive an email with the reset link</h4>")
        else
            return res.status(500).send("<h4 style='text-align:center'>Email sending failed</h4>");
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message : "Internal server error"
        })
    }
})


app.listen(process.env.PORT);
console.log('[' + new Date().toUTCString() + '] Server started, listening to',process.env.PORT);