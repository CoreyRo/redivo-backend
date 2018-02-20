const bcrypt = require('bcrypt')
const saltRounds = 10

module.exports = function (passport, User) {
    var LocalStrategy = require('passport-local').Strategy;

    passport.use('local-signup', new LocalStrategy({
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, username, password, done) {

        bcrypt.hash(password, saltRounds, function (err, hash) {
            User.create({
                username: req.body.username.toLowerCase(),
                password: hash,
                email: req.body.email.toLowerCase(),
                isAdmin: req.body.isAdmin,
                passwordResetToken: null,
                passwordResetExpire: null
                })
                .then(function (dbModel) {
                    User
                        .findOne({_id: dbModel._id})
                        .then(function (dbResult) {
                            console.log(`Logging in user: ${dbResult._id}`)
                            req.login(dbResult, function (err) {
                                if (err) {
                                    return done(err)
                                } else {
                                    return done(null, dbResult)
                                }
                            })
                        })
                        .catch(function (err) {
                            console.log("UserFound Error:\n", err)
                            return done(err)
                        })
                })
                .catch(function (err) {
                    console.log("Create New User Error:\n", err)
                    return done(err)
                })
        })
    }));

    passport.use('local-signin', new LocalStrategy({
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, username, password, done) {
        User
            .findOne({username})
            .then((user) => {
                if (!user) {
                    console.log('No user found')
                    return done(null, false,  req.flash('error', 'Username not found'))
                } else {
                    const hash = user.password
                    bcrypt.compare(password, hash, function (err, res) {
                        if (res) {
                            return done(null, user)
                        } else {
                            console.log("Pass do not match")
                            return done(null, false,  req.flash('error', 'Password entered does not match our records.'))

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
        console.log("req.session", req.session)
        done(null, user._id);
    });
    //deserialze
    passport.deserializeUser(function (id, done) {
        console.log("req.session", req.session)
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