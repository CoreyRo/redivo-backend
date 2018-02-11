
const user = require('../controllers/userController.js')
const passport = require('passport')

module.exports = function(router){

router
    .route('/api/nothing')
    .post(user.findOne)
}
