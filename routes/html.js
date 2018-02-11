
const db = require('../models')

module.exports = function(router){

    router.get('/', function(req, res, next) {
         if(req.isAuthenticated()){
            res.redirect('/home')
        }
        else{
            res.render('login', { 
                title: 'Gordons BBQ',
                subTitle: 'Admin Access Level',
                navBrand: 'ADMIN ACCESS LOGIN' 
            })
        }
    })
    router.get('/blog', function(req,res,next){
        if(req.isAuthenticated()){
            db.Blog
            .paginate({}, {
                page: 1,
                limit: 3,
                sort: ({updatedAt:-1}),
            })
            .then(function(dbModel){
                console.log("Find Page Blog Post:\n", dbModel)
                if (dbModel.docs.length <= 0){
                    res.render('blog', {
                        title: "The blog database is empty",
                        subTitle: 'Click "Create a new blog post" to start',
                        user: req.user.username
                    })
                }
                else{
                    res.render('blog', {
                        blog: dbModel,
                        user: req.user.username
                    })
                }
            })
            .catch(function(err){
                console.log("Find Page Blog Post Error:\n", err)
                res.json(err)
            })
        }
        else{
            res.render('login', { 
                title: 'Gordons BBQ',
                errors: [{
                    msg: 'You must be logged in to view this page'
                }],
                navBrand: 'ADMIN ACCESS LOGIN' 
            })
        }
    })

    router.get('/home', function(req, res){
        if(req.isAuthenticated()){
            res.render('home', {user: req.user.username})
        }
        else{
            res.render('login', { 
                title: 'Gordons BBQ',
                errors: [{
                    msg: 'You must be logged in to view this page'
                }],
                navBrand: 'ADMIN ACCESS LOGIN' 
            })
        }
    })

    router.get('/newpost', function(req, res, next) {
        if(req.isAuthenticated()){
            res.render('newblogpost', {user: req.user.username})
        }
        else{
            res.render('login', { 
                title: 'Gordons BBQ',
                errors: [{
                    msg: 'You must be logged in to view this page'
                }],
                navBrand: 'ADMIN ACCESS LOGIN' 
            })
        }
    })

    router.get('/api*', function(req, res, next){
        if(!req.isAuthenticated()){
            res.redirect('/')
        }
        else{
            next()
        }
    })





}


  
