const bcrypt = require('bcrypt')
const saltRounds = 10
const {check, validationResult} = require('express-validator/check');
const {matchedData, sanitize} = require('express-validator/filter');

module.exports = function (passport, User) {
    var LocalStrategy = require('passport-local').Strategy;

    passport.use('local-signup', new LocalStrategy({
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, username, password, done) {

        bcrypt
            .hash(password, saltRounds, function (err, hash) {
                User.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req
                        .body
                        .username
                        .toLowerCase(),
                    password: hash,
                    email: req
                        .body
                        .email
                        .toLowerCase(),
                    isAdmin: req.body.isAdmin,
                    passwordResetToken: null,
                    passwordResetExpire: null
                    })
                    .then(function (dbModel) {
                        return done(null, dbModel)
                    })
                    .catch(function (err) {
                        console.log("Create New User Error:\n", err)
                        return done(null, false, req.flash('error', 'Create New User Error:\n",' + err))
                    })
            })

    }));

    passport.use('local-signin', new LocalStrategy({
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, username, password, done) {
        User
            .findOne({username: username.toLowerCase()})
            .then((user) => {
                if (!user) {
                    console.log('No user found')
                    return done(null, false, req.flash('error', 'Username not found'))
                } else {
                    const hash = user.password
                    bcrypt.compare(password, hash, function (err, res) {
                        if (res) {
                            return done(null, user)
                        } else {
                            console.log("Pass do not match")
                            return done(null, false, req.flash('error', 'Password entered does not match our records.'))

                        }
                    })
                }
            })
            .catch((err) => {
                console.log('login find username err:', err)
                return done(err)
            })
    }))

    //serialze
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });
    //deserialze
    passport.deserializeUser(function (id, done) {
        User
            .findOne({_id: id})
            .then((res) => {
                if (res) {
                    done(null, res)
                } else {
                    done(res, null)
                }
            })
            .catch((err) => {
                console.log("Deserial FindOne error", err)
            })
    });
}