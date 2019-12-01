var express = require('express')
var router = express.Router()
var indexcontroller = require('../controllers/server/indexcontroller')

router.get('/', indexcontroller.index)

module.exports = router
