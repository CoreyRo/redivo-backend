const db = require('../models')
const formidable = require('formidable');
const path = require('path');  
const nl2br  = require('nl2br');



module.exports = {
    create: function(req, res){

        let form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
             db.Blog
                .create({
                    title: fields.title,
                    text: fields.text,
                    img: files.imageURL.name || fields.default_imageURL
                })
                .then(function(dbModel){
                    console.log("Create New Blog Post:\n", dbModel)
                    res.redirect('/blog')
                })
                .catch(function(err){
                    console.log("Create New Blog Post Error:\n", err)
                    res.json(err)
                })
            })

            form.on('fileBegin', function (name, file){
                if(file.name){
                    file.path = path.basename(path.dirname('../')) + '/public/imgs/' + file.name;  
                }
                return console.log('No new image uploaded')
            });
            
            form.on('end', function() {
                console.log('Thanks File Uploaded');
            });
        
    },

    findPages: function(req,res){
        db.Blog
        .paginate({}, {
            page: parseInt(req.params.num),
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
    },

    findAll: function(req,res){
        console.log("in find all")
        db.Blog
            .find({})
            .sort({dateAdded:-1})
            .then(function(dbModel){
                console.log("Find All Blog Post:\n", dbModel)
                res.json(dbModel)
            })
            .catch(function(err){
                console.log("Find All Blog Post Error:\n", err)
                res.json(err)
            })
    },

    findOne: function(req,res){
        console.log("in find one")
        db.Blog
            .findOne({_id: req.params.id})
            .then(function(dbModel){
                console.log("Find All Blog Post:\n", dbModel)
                res.render('blogpost', {
                    blog: dbModel,
                    
                })
            })
            .catch(function(err){
                console.log("Find All Blog Post Error:\n", err)
                res.json(err)
            })
    },

    update: function(req, res){
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            console.log("fields", fields)
            console.log("files", files)
            db.Blog
            .findOneAndUpdate({ _id: req.params.id }, {
                    title: fields.title,
                    text: fields.text || fields.current_text,
                    img: files.imageURL.name || fields.current_imageURL
                })
            .then(function(dbModel){
                console.log("update Blog Post:\n", dbModel)
                res.redirect('/blog')
            })
            .catch(function(err){
                console.log("update Blog Post Error:\n", err)
                res.json(err)                
            })
        })

        form.on('fileBegin', function (name, file){
            if(file.name){
                file.path = path.basename(path.dirname('../')) + '/public/imgs/' + file.name;  
            }
            return console.log('No new image uploaded')
        });
        
        form.on('end', function() {
            console.log('Thanks File Uploaded');
        });
    


    },

    destroy: function(req, res){
        db.Blog
            .findOne({ _id: req.params.id })
            .then(function(dbModel){
                console.log("destroy Blog Post:\n", dbModel)
                dbModel.remove()
                res.redirect('/blog')             
            })
            .catch(function(err){
                console.log("destroy Blog Post Error:\n", err)
                res.json(err)
            })
    }
}



