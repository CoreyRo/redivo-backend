const mongoose = require("mongoose");
const passport = require("passport");
const db = require("../models");
const fs = require("fs");
const bcrypt = require('bcrypt')
const saltRounds = 10
const async = require('async')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const {
    check,
    validationResult
} = require('express-validator/check');
const {
    matchedData,
    sanitize
} = require('express-validator/filter');

module.exports = {

    // Post /register
    doRegister: function (req, res) {
        passport.authenticate('local-signup')(req, res, function () {
            return res.json(req.user)
        })
    },

    // Post /login
    doLogin: function (req, res) {
        console.log("in doLogin")
        passport.authenticate('local-signin', {
            successRedirect: '/home',
            failureRedirect: '/'
        })
    },

    // Post /forgot-login
    doForgot: function (req, res, next) {
        async.waterfall([
            done => crypto.randomBytes(20, (err, buf) => done(err, buf.toString('hex'))),

            (token, done) => {
                const errors = validationResult(req)
                console.log("validated")
                if (!errors.isEmpty()) {
                    return (
                        res.render('forgot', {
                            title: 'Forgot Password',
                            pageTitle: "Forgot Password",
                            subTitle: 'Enter the email address for your account',
                            valErrors: errors.mapped()
                        })
                    )
                }
                else{
                    console.log("validated")
                db
                    .User
                    .findOneAndUpdate({
                        email: req.body.forgetEmail.toLowerCase()
                    }, {
                        resetPasswordToken: token,
                        resetPasswordExpire: Date.now() + 3600000 //60mins
                    })
                    .then(user => {
                        if (!user) {
                            res.render('forgot', {
                                title: 'The Redivo Group',
                                errors: [{
                                    alertType: 'danger',
                                    alertIcon: 'fas fa-exclamation-triangle',
                                    msg: 'No account with that email address exists'
                                }],
                                pageTitle: "Reset Password"
                            })
                        }
                        console.log(user)
                        done(null, token, user)
                    })
                    .catch(err =>{
                        console.log('token error: ', err)
                        done(err)
                    })
                }
            },
            (token, user, done) => {
                const smtpTransport = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: 'backend.test.address@gmail.com',
                        pass: process.env.GMAIL_PW
                    }
                })
                var mailOptions = {
                    to: user.email,
                    from: 'backend.test.address@gmail.com',
                    subject: 'Node.js Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of' +
                        ' the password for username: ' + user.username + '.\n\nPlease click on the following link, or paste this into your browser to comp' +
                        'lete the process:\n\nhttp://' + req.headers.host + '/reset/' + token + '\n\nIf you did not request this, please ignore this email and your password will' +
                        ' remain unchanged.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    console.log('mail sent');
                    done(err, 'done');
                    res.render('login', {
                        title: 'The Redivo Group',
                        errors: [{
                            alertIcon: 'fas fa-check',
                            alertType: 'success',
                            msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
                        }],
                        pageTitle: "Login"
                    })
                });
            }
        ], err => {
            if (err) {
                console.log("forgot error: ", err)
                res.render('forgot', {
                    title: 'The Redivo Group',
                    errors: [{
                        alertType: 'danger',
                        alertIcon: 'fas fa-exclamation-triangle',
                        msg: 'Oops! Something went wrong. Please Re-enter your information.'
                    }],
                    pageTitle: "Oops! Something went wrong."
                })
            }

        })
    },

    doResetCheck: function (req, res, next) {
        console.log("in reset check")
        db
            .User
            .findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpire: {
                    $gt: Date.now()
                }
            })
            .then(user => {
                if (!user) {
                    res.render('Login', {
                        title: 'The Redivo Group',
                        errors: [{
                            alertType: 'danger',
                            alertIcon: 'fas fa-exclamation-triangle',
                            msg: 'Oops! Password reset token is invalid or has expired.'
                        }],
                        pageTitle: "Oops! Something went wrong."
                    })
                } else {
                    res.render('reset', {
                        title: 'Reset Password',
                        pageTitle: "Reset Password",
                        subTitle: 'Enter a new password',
                        token: req.params.token
                    })
                }
            })
            .catch(err => console.log("error", err))
    },

    doReset: function (req, res, next) {

            async.waterfall([function (done) {
                    const errors = validationResult(req)
                    if (!errors.isEmpty()) {
                        return (res.render('reset', {
                            title: 'Reset Password',
                            pageTitle: "Reset Password",
                            subTitle: 'Enter a new password',
                            token: req.params.token,
                            valErrors: errors.mapped()
                        }))
                    } 
                    let password = req.body.password
                    bcrypt
                        .hash(password, saltRounds, function (err, hash) {
                            console.log('hash', hash)
                            console.log('token', req.params.token)
                            let conditions = {resetPasswordToken: req.params.token, resetPasswordExpires: {$gte: Date.now()}}
                            db.User
                                .findOneAndUpdate({
                                }, {
                                    password: hash,
                                    resetPasswordToken: null,
                                    resetPasswordExpire: null
                                })
                                .then(user => { 
                                    console.log('user', user)
                                    if (!user) {
                                        res.render('login', {
                                            title: 'The Redivo Group',
                                            errors: [{
                                                alertType: 'danger',
                                                alertIcon: 'fas fa-exclamation-triangle',
                                                msg: 'Oops! Password reset token is invalid or has expired.'
                                            }],
                                            pageTitle: "Oops! Something went wrong."
                                        })
                                    }
                                    done(null, user)
                                })
                                .catch(err => console.log("update-pass err: ", err))
                        })
                    },
                    function (user, done) {
                        var smtpTransport = nodemailer.createTransport({
                            service: 'Gmail',
                            auth: {
                                user: 'backend.test.address@gmail.com',
                                pass: process.env.GMAIL_PW
                            }
                        });
                        var mailOptions = {
                            to: user.email,
                            from: 'backend.test.address@gmail.com',
                            subject: 'Your password has been changed',
                            text: 'Hello,\n\nThis is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                        };
                        smtpTransport.sendMail(mailOptions, function (err) {
                            console.log('mail sent');
                            done(err, 'done');
                            res.render('login', {
                                title: 'The Redivo Group',
                                errors: [{
                                    alertIcon: 'fas fa-check',
                                    alertType: 'success',
                                    msg: 'Success! Your password has been changed.'
                                }],
                                pageTitle: "Login"
                            })
                        });
                    }
                ],
                err => {
                    if (err) {
                        console.log("forgot error: ", err)
                        res.render('forgot', {
                            title: 'The Redivo Group',
                            errors: [{
                                alertType: 'danger',
                                alertIcon: 'fas fa-exclamation-triangle',
                                msg: 'Oops! Something went wrong. Please Re-enter your information.'
                            }],
                            pageTitle: "Oops! Something went wrong."
                        })
                    }

                })
        
    }

}