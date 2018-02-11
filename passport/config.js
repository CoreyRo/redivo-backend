const bcrypt = require('bcrypt')
const saltRounds = 10

module.exports = function(passport, User){
	console.log("in passport")
	var LocalStrategy = require('passport-local').Strategy;


	passport.use('local-signup', new LocalStrategy({
        passReqToCallback: true // allows us to pass back the entire request to the callback
	},
		function(req, username, password, done){
			console.log("creating user", req.body)

			bcrypt.hash(password, saltRounds, function(err, hash) {
				User
				.create({
					username: req.body.username,
					password: hash
				})
				.then(function(dbModel){
					User.findOne({_id: dbModel._id})
					.then(function(dbResult){
						console.log(`Logging in user: ${dbResult._id}`)
						req.login(dbResult, function(err){
							if (err) {
								console.log("req.login error:", err)
								return done(err)
							}
							else{
								console.log(`Logged in user: ${dbResult.username}`)
								return done(null, dbResult)
							}
						})
					})
					.catch(function(err){
						console.log("UserFound Error:\n", err)
						return done(err)
					})
				})
				.catch(function(err){
					console.log("Create New User Error:\n", err)
					return done(err)
				})
			})
		}

 
   ));

	passport.use('local-signin', new LocalStrategy({
         passReqToCallback: true // allows us to pass back the entire request to the callback
    },
		function(req, username, password, done) {
			console.log("req",req.body)
			console.log("username", username)
			console.log('password', password)
				User
				.findOne({username})
				.then((user) =>{
					if (!user){
						console.log('No user found')
						return done(null, false, { 
							errors: [
								{msg: 'No user found'}
							]  
						})
					}
					else{
						const hash = user.password
						bcrypt.compare(password, hash, function(err,res){
							if (res) {              
								return done(null, user)
							}
							else{
								return done(null, false)
							}
						})
					}
				})
				.catch((err) =>{
					console.log('login find username err:', err)
					return done(err)
				})
	}))


	
	//serialze
	passport.serializeUser(function(user, done) {
		console.log("Serial user id", user._id)
		done(null, user._id);
	});
	//deserialze
	passport.deserializeUser(function(id, done) {
		console.log("Deserial user id", id)
		User.findOne({_id: id })
		.then((res) => {
			if (res) {
				done(null, res)
			}
			else{
				done(res.errors, null)
			}
		})
		.catch((err) => {
			console.log("Deserial FindOne error", err)
		})
	});
}


