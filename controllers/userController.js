const db = require('../models')
const bcrypt = require('bcrypt')
const saltRounds = 10


module.exports = {


    create: function(req, res){
        console.log("In create")
        let username = req.body.username
        let password = req.body.password
        console.log("creating user")
        bcrypt.hash(password, saltRounds, function(err, hash) {
 
            db.User
            .create({
                username: req.body.username,
                password: hash
            })
            .then(function(dbModel){
                console.log("Create New User:\n", dbModel)
                res.json(dbModel)
            })
            .catch(function(err){
                console.log("Create New User Error:\n", err)
                res.json(err)
            })
        });
    },

    findAll: function(req,res){
        console.log("in find all")
        db.User
            .find({})
            .then(function(dbModel){
                console.log("Find All User:\n", dbModel)
                res.json(dbModel)
            })
            .catch(function(err){
                console.log("Find All User Error:\n", err)
                res.json(err)
            })
    },

    findOne: function(req,res){
        console.log("in find one")
        db.User
            .find({username:req.body.username})
            .then(function(dbModel){
                console.log("Find User:\n", dbModel[0])
                const user_id = dbModel[0]._id
                console.log("Id", user_id)
                req.login(user_id, function(err){
                    res.redirect('/')
                })

            })
            .catch(function(err){
                console.log("Find User Error:\n", err)
                res.json(err)
            })
    },

    update: function(req, res){
        db.User
            .findOneAndUpdate({ _id: req.params.id }, req.body)
            .then(function(dbModel){
                console.log("update User:\n", dbModel)
            })
            .catch(function(err){
                console.log("update User Error:\n", err)
                res.json(err)                
            })
    },

    destroy: function(req, res){
        db.User
            .findById({ _id:req.params.id })
            .then(function(dbModel){
                console.log("destroy User:\n", dbModel)
                dbModel.remove()
                res.json(dbModel)                
            })
            .catch(function(err){
                console.log("destroy User Error:\n", err)
                res.json(err)
            })
    },

    login: function(req,res){

    }
}



