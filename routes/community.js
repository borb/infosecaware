var express = require('express')
var router = express.Router()
var communitycontroller = require('../controllers/server/communitycontroller')

router.get('/', communitycontroller.index)

module.exports = router
