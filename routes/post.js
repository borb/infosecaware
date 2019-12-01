var express = require('express')
var router = express.Router()
var postcontroller = require('../controllers/server/postcontroller')

router.get('/', postcontroller.index)

module.exports = router
