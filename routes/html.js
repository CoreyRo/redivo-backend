const db = require('../models')

module.exports = function (router) {

    router
        .get('/', function (req, res, next) {
            if (req.isAuthenticated()) {
                res.redirect('/home')
            } else {
                res.render('login', {
                    title: 'The Redivo Group',
                    subTitle: 'Admin Access Level',
                    pageTitle: "Login",
                    error: req.flash('error')
                })
            }
        })
    router.get('/blog', function (req, res, next) {
        if (req.isAuthenticated()) {
            db
                .Blog
                .paginate({}, {
                    page: 1,
                    limit: 3,
                    sort: ({updatedAt: -1})
                })
                .then(function (dbModel) {
                    console.log("Find Page Blog Post:\n", dbModel)
                    if (dbModel.docs.length <= 0) {
                        res.render('blog', {
                            title: "Blog Database is Empty",
                            subTitle: 'Click "Create a new blog post" to start',
                            username: req.user.username
                        })
                    } else {
                        res.render('blog', {
                            blog: dbModel,
                            username: req.user.username,
                            title: 'Blog Entries Page ' + dbModel.page + ' of ' + dbModel.pages,
                            pageTitle: "Redivo Group Blog Entries"
                        })
                    }
                })
                .catch(function (err) {
                    console.log("Find Page Blog Post Error:\n", err)
                    res.json(err)
                })
        } else {
            res.render('login', {
                title: 'The Redivo Group',
                errors: [
                    {
                        alertType: 'danger',
                        alertIcon: 'fas fa-exclamation-triangle',
                        msg: 'You must be logged in to view this page'
                    }
                ],
                pageTitle: "Login"
            })
        }
    })

    router.get('/home', function (req, res) {
        if (req.isAuthenticated()) {
            res.render('home', {
                title: "Logged in as: " + req.user.username,
                pageTitle: 'Redivo Blog - Home',
                username: req.user.username
            })
        } else {
            res.render('login', {
                title: 'The Redivo Group',
                errors: [
                    {
                        alertType: 'danger',
                        alertIcon: 'fas fa-exclamation-triangle',
                        msg: 'You must be logged in to view this page'
                    }
                ],
                pageTitle: "Login"
            })
        }
    })

    router.get('/newpost', function (req, res, next) {
        if (req.isAuthenticated()) {
            res.render('newblogpost', {
                user: req.user.username,
                title: "Create New Blog Entry",
                pageTitle: "Redivo Group - New Blog Entry",
                username: req.user.username
            })
        } else {
            res.render('login', {
                title: 'The Redivo Group',
                errors: [
                    {
                        alertType: 'danger',
                        alertIcon: 'fas fa-exclamation-triangle',
                        msg: 'You must be logged in to view this page'
                    }
                ],
                pageTitle: "Login"
            })
        }
    })

    router.get('/api*', function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/')
        } else {
            next()
        }
    })

    router.get('/register', function (req, res) {
        if (req.isAuthenticated()) {
            res.render('register', {
                user: req.user.username,
                title: "Register New Admin User",
                pageTitle: "Redivo Group - Add User",
                username: req.user.username
            })
        } else {
            res.render('login', {
                title: 'The Redivo Group',
                errors: [
                    {
                        alertType: 'danger',
                        alertIcon: 'fas fa-exclamation-triangle',
                        msg: 'You must be logged in to view this page'
                    }
                ],
                pageTitle: "Login"
            })
        }
    })

    router.get('/forgot', function (req, res) {
        (res.render('forgot', {
            title: 'Forgot Password',
            pageTitle: "Forgot Password",
            subTitle: 'Enter the email address for your account',
        }))

    })

    // router.get('/:token', function (req, res) {
    //     console.log('req.params.token', req.params)
    //     res.render('reset', {
    //         title: 'Reset Password',
    //         pageTitle: "Reset Password",
    //         subTitle: 'Enter a new password',
    //         token: req.params.token
    //     })

    // })

}
