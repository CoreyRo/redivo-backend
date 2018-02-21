const router = require("express").Router();
const auth = require("../controllers/authController.js");
const {check, validationResult} = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');
const db = require('../models')

module.exports = function (router, passport) {

    router
        .route("/auth/create")
        .post([
            //email validation
            check('email').exists(),
            check('confirmEmail', 'Emails do not match, please try again')
                .exists()
                .custom((value, {req}) => value === req.body.email),
            check('email', 'Please enter a valid email address').isEmail(),
            // password validation
            check('password').exists(),
            check('confirmPass', 'Passwords do not match, please try again')
                .exists()
                .custom((value, {req}) => value === req.body.password),
            check('password', 'Password must be between 8-100 characters long').isLength({min: 6, max: 100}),
            check('password', 'Password must include one lowercase character, one uppercase character, a number' +
                    ', and a special character.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
            //username validation
            check('username').exists(),
            check('username', 'Username must be between 4-16 characters long.').isLength({min: 4, max: 16}),
            check('username', `Usernames can only contain alphanumeric characters and "_"'s`).matches(/^[a-zA-Z0-9_]+$/),
            //first name validation
            check('firstName').exists(),
            //last name validation
            check('lastName').exists(),
        ], auth.registerUser)

    router.post('/login', passport.authenticate('local-signin', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash: true
    }))

    router.get('/logout', function (req, res) {
        req
            .session
            .destroy()
        req.logout()
        res.redirect('/')
    })

    router
        .route('/forgot-login')
        .post([
            check('forgetEmail')
                .isEmail()
                .withMessage('must be an email')
        ], auth.doForgot)

    router
        .route('/reset/:token')
        .get(auth.doResetCheck)
        .post([
            check('password').exists(),
            check('confirm', 'Passwords do not match, please try again')
                .exists()
                .custom((value, {req}) => value === req.body.password),
            check('password', 'Password must be between 8-100 characters long').isLength({min: 6, max: 100}),
            check('password', 'Password must include one lowercase character, one uppercase character, a number' +
                    ', and a special character.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
        ], auth.doReset)

    router
        .route('/change-password')
        .post([
            check('password').exists(),
            check('confirm', 'Passwords do not match, please try again')
                .exists()
                .custom((value, {req}) => value === req.body.password),
            check('password', 'Password must be between 8-100 characters long').isLength({min: 6, max: 100}),
            check('password', 'Password must include one lowercase character, one uppercase character, a number' +
                    ', and a special character.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
        ], auth.doPassChange)

    router
        .route('/users/getpages/:num')
        .get(auth.usersPage)

    router
        .route('/users/:id')
        .get(auth.findOne)

    router
        .route('/users/update/:id')
        .put([
            //email validation
            check('email').exists(),
            check('confirmEmail', 'Emails do not match, please try again')
                .exists()
                .custom((value, {req}) => value === req.body.email),
            check('email', 'Please enter a valid email address').isEmail(),
            //username validation
            check('username').exists(),
            check('username', 'Username must be between 4-16 characters long.').isLength({min: 4, max: 16}),
            check('username', `Usernames can only contain alphanumeric characters and _'s`).matches(/^[a-zA-Z0-9_]+$/),
            //first name validation
            check('firstName').exists(),
            //last name validation
            check('lastName').exists(),
        ], auth.update)

    router
        .route('/users/destroy/:id')
        .delete(auth.destroy)

}
