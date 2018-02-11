const mongoose = require("mongoose");
const passport = require("passport");
const db = require("../models");
const fs = require("fs");


module.exports = {  

	// Post /register
	doRegister : function(req, res) {
        passport.authenticate('local-signup')(req, res, function () {
            return res.json(req.user)
        })
	},
	
    // Post /login
	doLogin : function(req, res) {
        console.log("in doLogin")
		passport.authenticate('local-signin', {
            successRedirect: '/home',
            failureRedirect: '/'
            }
        )
	}
}

