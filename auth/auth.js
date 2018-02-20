const router = require("express").Router();
const auth = require("../controllers/authController.js");
const {check, validationResult} = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');

module.exports = function (router, passport) {

    router
        .route("/auth/create")
        .post(auth.doRegister)

    router.post('/login', passport.authenticate('local-signin', {
        successRedirect: '/home',
        failureRedirect: '/',
        failureFlash: true
    }))

    router.get('/logout', function (req, res) {
        req.logout()
        req
            .session
            .destroy()
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
}
