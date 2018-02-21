
const user = require('../controllers/userController.js')
const blog = require('../controllers/blogController.js')

module.exports = function(router){

	router
		.route('/api/blog/getall')
		.get(blog.findAll)

	router
		.route('/blog/getpages/:num')
		.get(blog.findPages)

	router
		.route('/api/blog/create')
		.post(blog.create)

	router
		.route('/api/blog/edit/:id')
		.put(blog.update)

	router
		.route('/api/blog/getone/:id')
		.get(blog.findOne)
	

	router
		.route('/api/blog/destroy/:id')
		.delete(blog.destroy)

}
